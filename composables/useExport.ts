const html2canvasOptions = {
  scale: 2,
  backgroundColor: '#FFFFFF',
  onclone: (clonedDoc: Document) => {
    clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach((el) => {
      const href = el.getAttribute('href') || ''
      if (href.includes('fonts.googleapis.com') || href.includes('fonts.gstatic.com')) {
        el.remove()
      }
    })
  },
}

async function capturePage(el: HTMLElement): Promise<HTMLCanvasElement | null> {
  try {
    const { default: html2canvas } = await import('html2canvas')
    return await html2canvas(el, html2canvasOptions)
  } catch (err) {
    console.error('html2canvas capture failed:', err)
    return null
  }
}

export const useExport = () => {
  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadMD = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    triggerDownload(blob, `${filename}.md`)
    return { success: true }
  }

  const downloadPDF = async (previewEl: HTMLElement): Promise<{ success: boolean; error?: string }> => {
    // Hide measurement containers
    const measures = previewEl.querySelectorAll('.measure-container')
    measures.forEach((el) => (el as HTMLElement).style.display = 'none')

    try {
      // Capture each already-paginated page from the editor preview
      const pageEls = previewEl.querySelectorAll('.resume-page') as NodeListOf<HTMLElement>
      if (pageEls.length === 0) {
        return { success: false, error: '未找到预览页面，请确保内容已渲染' }
      }

      const dataUrls: string[] = []
      for (const pageEl of pageEls) {
        const canvas = await capturePage(pageEl)
        if (!canvas) {
          return { success: false, error: '页面截图失败，请重试' }
        }
        dataUrls.push(canvas.toDataURL('image/png'))
      }

      // Build a self-contained print page with the captured page images
      const pageImages = dataUrls.map(url =>
        `<div class="page"><img src="${url}" alt="" /></div>`
      ).join('\n')

      const printHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #fff; }
  .page {
    width: 794px;
    height: 1123px;
    background: #fff;
    overflow: hidden;
    page-break-after: always;
  }
  .page:last-child { page-break-after: auto; }
  .page img { width: 100%; display: block; }
  @media print {
    html, body { margin: 0; padding: 0; }
    @page { size: A4; margin: 0; }
  }
</style>
</head>
<body>
${pageImages}
<script>window.onload = function() { window.print(); }</script>
</body>
</html>`

      const win = window.open('', '_blank')
      if (!win) {
        return { success: false, error: '弹窗被浏览器拦截，请允许弹窗后重试' }
      }
      win.document.write(printHtml)
      win.document.close()

      return { success: true }
    } catch (err: any) {
      console.error('PDF export failed:', err)
      return { success: false, error: err.message || '导出失败，请重试' }
    } finally {
      measures.forEach((el) => (el as HTMLElement).style.display = '')
    }
  }

  const downloadPNG = async (element: HTMLElement, filename: string): Promise<{ success: boolean; error?: string }> => {
    const measures = element.querySelectorAll('.measure-container')
    measures.forEach((el) => (el as HTMLElement).style.display = 'none')

    try {
      const canvas = await capturePage(element)
      if (!canvas) {
        return { success: false, error: '截图失败，请重试' }
      }

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            triggerDownload(blob, filename)
            resolve({ success: true })
          } else {
            resolve({ success: false, error: '图片生成失败，可能存在跨域资源导致画布被污染' })
          }
        }, 'image/png')
      })
    } catch (err: any) {
      console.error('PNG export failed:', err)
      return { success: false, error: err.message || '导出失败，请重试' }
    } finally {
      measures.forEach((el) => (el as HTMLElement).style.display = '')
    }
  }

  return { downloadMD, downloadPDF, downloadPNG }
}
