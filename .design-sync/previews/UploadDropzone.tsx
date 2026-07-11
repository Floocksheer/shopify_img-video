import { UploadDropzone } from "lumora";

const productSvg =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#28244A'/><stop offset='1' stop-color='#121218'/></linearGradient></defs><rect width='400' height='400' fill='url(#g)'/><ellipse cx='200' cy='330' rx='120' ry='16' fill='rgba(0,0,0,0.45)'/><rect x='140' y='110' width='120' height='210' rx='16' fill='#7C6CFF'/><rect x='158' y='96' width='84' height='28' rx='10' fill='#9284FF'/></svg>`,
  );

export function Empty() {
  return (
    <div className="w-full max-w-md">
      <UploadDropzone image={null} onImage={() => {}} />
    </div>
  );
}

export function WithImage() {
  return (
    <div className="w-full max-w-md">
      <UploadDropzone image={productSvg} onImage={() => {}} />
    </div>
  );
}
