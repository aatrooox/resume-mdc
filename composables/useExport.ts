const snapdomOptions = {
  scale: 2,
  backgroundColor: '#FFFFFF',
  embedFonts: true,
}

async function capturePage(el: HTMLElement): Promise<HTMLCanvasElement | null> {
  try {
    const { snapdom } = await import('@zumer/snapdom')
    const img = await snapdom.toPng(el, snapdomOptions)
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img, 0, 0)
    return canvas
  } catch (err) {
    console.error('snapdom capture failed:', err)
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
    const measures = previewEl.querySelectorAll('.measure-container')
    measures.forEach((el) => (el as HTMLElement).style.display = 'none')

    try {
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

  const downloadPNG = async (previewEl: HTMLElement): Promise<{ success: boolean; error?: string }> => {
    const measures = previewEl.querySelectorAll('.measure-container')
    measures.forEach((el) => (el as HTMLElement).style.display = 'none')

    try {
      const pageEls = previewEl.querySelectorAll('.resume-page') as NodeListOf<HTMLElement>
      if (pageEls.length === 0) {
        return { success: false, error: '未找到预览页面，请确保内容已渲染' }
      }

      for (let i = 0; i < pageEls.length; i++) {
        const canvas = await capturePage(pageEls[i])
        if (!canvas) {
          return { success: false, error: '页面截图失败，请重试' }
        }
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/png')
        })
        if (!blob) {
          return { success: false, error: '图片生成失败，请重试' }
        }
        const name = pageEls.length > 1
          ? `resume-${i + 1}.png`
          : 'resume.png'
        triggerDownload(blob, name)
      }

      return { success: true }
    } catch (err: any) {
      console.error('PNG export failed:', err)
      return { success: false, error: err.message || '导出失败，请重试' }
    } finally {
      measures.forEach((el) => (el as HTMLElement).style.display = '')
    }
  }

  return { downloadMD, downloadPDF, downloadPNG }
}
