const cartItemUpdateFormElements = $(".cart-item-management");
const cartTotalPriceElement = $("#cart-total-price");
const cartBadgeElements = $(".nav-items .badge");
const buyProductButton = $("#cart-total button");
const toastHeader = $(".toast-header");
const toastBody = $(".toast-body");

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

buyProductButton.click(async () => {
  const csrfToken = buyProductButton.data("csrf");
  let response;

  try {
    response = await fetch("/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _csrf: csrfToken,
      }),
    });
  } catch (error) {
    alert("Something went wrong!!!");
    return;
  }

  if (!response.ok) {
    alert("Something went wrong!");
    return;
  }

  const responseData = await response.json();
  const now = new Date();
  const imgAttrs =
    responseData.isPaid === 0
      ? { src: "/assets/icons/success.png", alt: "success" }
      : { src: "/assets/icons/fail.png", alt: "fail" };
  const toastMessages = {
    0: [
      "Purchased Successful!!!",
      `Your current account balance is: ${responseData.surplus}`,
    ],
    1: [
      "Purchased Failed!!!",
      `Your current account balance is: ${responseData.surplus}. It is not enough to pay for this order.`,
    ],
    2: [
      "Purchased Failed!!!",
      "You have some orders that have not been paid for yet.",
    ],
  };

  toastHeader.find("img").attr(imgAttrs);
  toastHeader.find("strong").text(responseData.customer);
  toastHeader
    .find("small")
    .text(
      `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
    );

  toastBody.children().first().text(toastMessages[responseData.isPaid][0]);
  toastBody.children().last().text(toastMessages[responseData.isPaid][1]);

  const toastLive = $("#liveToast");
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLive[0]);
  toastBootstrap.show();
});
