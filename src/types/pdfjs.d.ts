declare module 'pdfjs-dist/build/pdf' {
  export * from 'pdfjs-dist'
}

declare module 'pdfjs-dist/build/pdf.worker.entry' {}

declare module 'pdfjs-dist/legacy/build/pdf' {
  const pdfjsLib: any
  export = pdfjsLib
}

declare module 'pdfjs-dist/legacy/build/pdf.worker.min.js' {
  const workerSrc: string
  export default workerSrc
}
