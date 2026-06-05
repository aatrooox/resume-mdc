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
  }

  const downloadPDF = (content: string) => {
    localStorage.setItem('print_content', content)
    const win = window.open('/print', '_blank')
    // Note: print is auto-triggered by the /print page on mount
  }

  const downloadPNG = async (element: HTMLElement, filename: string) => {
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
      canvas.toBlob((blob) => {
        if (blob) triggerDownload(blob, filename)
      }, 'image/png')
    } catch (err) {
      console.error('PNG export failed:', err)
    } finally {
      measures.forEach((el) => (el as HTMLElement).style.display = '')
    }
  }

  return { downloadMD, downloadPDF, downloadPNG }
}
