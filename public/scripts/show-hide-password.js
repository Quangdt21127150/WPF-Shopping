const passwordFrame = $("#password-frame");
const passwordFrame2 = $("#password-frame2");

function ShowOrHidePassword(event) {
  event.preventDefault();
  const frame = $(this).closest(".input-group");
  if (frame.find("input").attr("type") === "text") {
    frame.find("input").attr("type", "password");
    frame.find("i").addClass("fa-eye-slash");
    frame.find("i").removeClass("fa-eye");
  } else {
    frame.find("input").attr("type", "text");
    frame.find("i").removeClass("fa-eye-slash");
    frame.find("i").addClass("fa-eye");
  }
}

passwordFrame.find("a").click(ShowOrHidePassword);
passwordFrame2.find("a").click(ShowOrHidePassword);
