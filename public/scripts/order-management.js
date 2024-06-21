$(".order-actions form select").change(function () {
  const form = $(this).closest("form");
  const formData = new FormData(form[0]);
  const newStatus = formData.get("status");
  const orderId = formData.get("orderid");
  const csrfToken = formData.get("_csrf");

  fetch(`/admin/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({
      newStatus: newStatus,
      _csrf: csrfToken,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "Something went wrong - could not update order status."
        );
      }
      return response.json();
    })
    .then((responseData) => {
      form
        .parent()
        .parent()
        .find(".badge")
        .text(responseData.newStatus.toUpperCase());
    })
    .catch((error) => {
      alert(error.message);
    });
});
