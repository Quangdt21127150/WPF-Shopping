$(function () {
  const forms = $(".voucher-form");

  function pluralize(noun) {
    // Check if the noun ends with 's', 'x', 'z', 'sh', or 'ch'
    if (noun.match(/(s|x|z|sh|ch)$/)) {
      return noun + "es";
    }

    // Check if the noun ends with 'y' and is preceded by a consonant
    if (noun.match(/[^aeiou]y$/)) {
      return noun.slice(0, -1) + "ies";
    }

    // Check if the noun ends with 'f' or 'fe'
    if (noun.match(/(f|fe)$/)) {
      return noun.replace(/(f|fe)$/, "ves");
    }

    // Check if the noun ends with a consonant followed by 'o'
    if (noun.match(/[^aeiou]o$/)) {
      return noun + "es";
    }

    // For other nouns, simply add 's'
    return noun + "s";
  }

  forms.each(function () {
    //Control input value
    const percentageFrame = $(this).find("#discount");
    const quantityFrame = $(this).find("#quantity");
    const productFrame = $(this).find("#product");
    const extraPointFrame = $(this).find("#extraPoint");

    percentageFrame.on("input", function () {
      const value = $(this).val();
      if (value.length > 2) {
        $(this).val(value.slice(0, 2));
      }
    });

    quantityFrame.on("input", function () {
      const value = $(this).val();
      if (value.length > 3) {
        $(this).val(value.slice(0, 3));
      }
    });

    extraPointFrame.on("input", function () {
      const value = $(this).val();
      if (value.length > 5) {
        $(this).val(value.slice(0, 5));
      }
    });

    //Switch radio
    const radioButton = $(this).find('input[type="radio"]');
    const valueFrame = $(this).find("#value");
    const discount = $(this).find(".discount");
    const free = $(this).find(".free");
    const extra = $(this).find(".extra");

    function radioChange() {
      discount.addClass("d-none").attr("required", false);
      free.addClass("d-none").attr("required", false);
      extra.addClass("d-none").attr("required", false);
      percentageFrame.val("");
      quantityFrame.val("");
      productFrame.val("");
      extraPointFrame.val("");

      if (radioButton[0].checked) {
        discount.removeClass("d-none").attr("required", true);
      } else if (radioButton[1].checked) {
        free.removeClass("d-none").attr("required", true);
      } else {
        extra.removeClass("d-none").attr("required", true);
      }
    }

    radioChange();
    radioButton.change(radioChange);

    $(this).on("reset", function () {
      setTimeout(radioChange, 0);
    });

    $(this).submit(function () {
      if (radioButton[0].checked) {
        valueFrame.val("d" + percentageFrame.val());
      } else if (radioButton[1].checked) {
        const quantity = parseInt(quantityFrame.val());
        let productName;
        quantity === 1
          ? (productName = productFrame.val())
          : (productName = pluralize(productFrame.val()));
        valueFrame.val("g" + quantity + "-" + productName);
      } else {
        valueFrame.val("e" + extraPointFrame.val());
      }
    });
  });
});
