const errorModal = new bootstrap.Modal($("#errorModal"));
const errorMessage = $("#errorMessage").text();

if (errorMessage) {
  errorModal.show();
}
