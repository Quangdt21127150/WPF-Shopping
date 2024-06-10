const imagePickerElement = $("#image-upload-control input");
const imagePreviewElement = $("#image-upload-control img");

function updateImagePreview() {
  const files = imagePickerElement[0].files;

  if (!files || files.length === 0) {
    imagePreviewElement.hide();
    return;
  }

  const pickedFile = files[0];

  imagePreviewElement.attr("src", URL.createObjectURL(pickedFile)).show();
}

imagePickerElement.change(updateImagePreview);
