
export default async () => {
  const formPdfBytes = await fetch('https://www.irs.gov/pub/irs-pdf/fw4.pdf').then(res => res.arrayBuffer())

  // const pdfDoc = await PDFDocument.load(formPdfBytes)

  // const form = pdfDoc.getForm()
  // const fieldName = form.getFields()[0].getName()
  // console.log(fieldName)

  // // Convert the code units to a string
  // // const fieldName = String.fromCharCode(...codeUnits);
  // // console.log(fieldName);
  // PDFName.of(fieldName)
  return (
    <>
    </>
  )
}