const cartItemUpdateFormElements = $(".cart-item-management");
const cartTotalPriceElement = $("#cart-total-price");
const cartBadgeElements = $(".nav-items .badge");
const buyProductButton = $("#cart-total button");

async function updateCartItem(form) {
  const productId = $(form).data("productid");
  const csrfToken = $(form).data("csrf");
  const quantity = $(form).find("input").val();
  let response;

  try {
    response = await fetch("/cart/items", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: productId,
        quantity: quantity,
        _csrf: csrfToken,
      }),
    });
  } catch (error) {
    alert("Something went wrong!");
    return;
  }

  if (!response.ok) {
    alert("Something went wrong!");
    return;
  }

  const responseData = await response.json();
  const updatedCartData = responseData.updatedCartData;

  if (updatedCartData.updatedItemPrice === 0) {
    $(form).closest(".cart-item").remove();
  } else {
    $(form)
      .closest(".cart-item")
      .find(".cart-item-price")
      .text(updatedCartData.updatedItemPrice.toLocaleString("vi-VN"));
  }

  cartTotalPriceElement.text(
    updatedCartData.newTotalPrice.toLocaleString("vi-VN")
  );
  buyProductButton.toggle(updatedCartData.newTotalPrice !== 0);

  cartBadgeElements.text(updatedCartData.newTotalQuantity);
}

cartItemUpdateFormElements.each(function () {
  $(this)
    .find("input")
    .change(() => updateCartItem(this));
});
