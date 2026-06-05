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

  const downloadPDF = (content: string) => {
    localStorage.setItem('print_content', content)
    window.open('/print', '_blank')
    return { success: true }
  }

  const downloadPNG = async (element: HTMLElement, filename: string): Promise<{ success: boolean; error?: string }> => {
    // Remove measurement containers so html2canvas doesn't capture them
    const measures = element.querySelectorAll('.measure-container')
    measures.forEach((el) => (el as HTMLElement).style.display = 'none')

    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      })

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
