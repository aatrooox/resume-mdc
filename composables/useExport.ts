export const useExport = () => {
  const downloadMD = (content: string, filename: string) => {}
  const downloadPDF = (content: string) => {}
  const downloadPNG = async (element: HTMLElement, filename: string) => {}
  return { downloadMD, downloadPDF, downloadPNG }
}
