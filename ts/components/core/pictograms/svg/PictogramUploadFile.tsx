import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGPictogramProps } from "../Pictogram";

const PictogramUploadFile = ({ size, color, ...props }: SVGPictogramProps) => (
  <Svg fill="none" width={size} height={size} viewBox="0 0 120 120" {...props}>
    <Path
      d="M84.798 1.531a2.392 2.392 0 0 0-1.721-.765H44.472c-6.359 0-11.666 4.66-12.718 10.732-5.354.933-9.562 5.164-10.494 10.495-6.19.956-10.948 6.335-10.948 12.788v73.004c0 7.124 5.761 12.981 12.885 12.981h52.398c6.359 0 11.642-4.638 12.718-10.71 5.474-.836 9.824-5.139 10.756-10.59 6.072-1.051 10.685-6.357 10.685-12.74V28.781a2.41 2.41 0 0 0-.645-1.674L84.799 1.531Zm.574 7.673 16.447 17.14H91.205c-3.156 0-5.833-2.535-5.833-5.69V9.204Zm-9.777 106.781H23.197c-4.495 0-8.104-3.705-8.104-8.2V34.782c0-3.73 2.39-6.885 5.976-7.84v70.326c0 7.124 5.762 12.98 12.884 12.98h49.411a8.106 8.106 0 0 1-7.769 5.737Zm10.758-10.518h-52.4c-4.47 0-8.103-3.705-8.103-8.2V24.265a8.106 8.106 0 0 1 5.737-7.77V86.75c0 7.123 5.761 12.98 12.885 12.98H94.12a8.104 8.104 0 0 1-7.768 5.737ZM96.87 94.949H44.472c-4.47 0-8.104-3.705-8.104-8.2V13.746c0-4.47 3.61-8.2 8.104-8.2h36.12v15.108c0 5.809 4.804 10.47 10.613 10.47h13.769V86.75c0 4.495-3.609 8.2-8.104 8.2Z"
      fill={color}
    />
    <Path
      d="M90.344 79.65H50.998a2.398 2.398 0 0 0-2.39 2.39 2.398 2.398 0 0 0 2.39 2.391h39.37a2.398 2.398 0 0 0 2.39-2.39 2.403 2.403 0 0 0-2.414-2.39ZM58.36 52.734l9.801-10.59v26.104a2.398 2.398 0 0 0 2.39 2.39 2.398 2.398 0 0 0 2.39-2.39V42.144l9.922 10.59a2.488 2.488 0 0 0 1.768.765 2.48 2.48 0 0 0 1.65-.645c.956-.91 1.027-2.415.12-3.371L72.414 34.447a2.406 2.406 0 0 0-1.745-.765c-.669 0-1.29.287-1.745.765L54.919 49.483c-.908.956-.885 2.486.095 3.37.98.909 2.463.837 3.347-.12Z"
      fill={color}
    />
  </Svg>
);

export default PictogramUploadFile;