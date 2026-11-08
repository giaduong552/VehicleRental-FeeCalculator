(function (root) {
  const Constants =
    typeof module !== "undefined" && module.exports
      ? require("./constants.js")
      : root.Constants;

  const { DISCOUNTS, MESSAGES } = Constants;

  /**
   * Kiểm tra tính hợp lệ và điều kiện áp dụng của mã giảm giá
   * @param {string} rawCode
   * @param {number} rentalFee - Tiền thuê xe gốc (chưa cộng phụ phí)
   * @returns {{ valid: boolean, code: string, message: string, isEmpty: boolean }}
   */
  function validateDiscountCode(rawCode, rentalFee = 0) {
    if (rawCode === null || rawCode === undefined) {
      return { valid: true, code: "", message: "", isEmpty: true };
    }

    const cleanCode = String(rawCode).trim().toUpperCase();

    if (cleanCode === "") {
      return { valid: true, code: "", message: "", isEmpty: true };
    }

    if (!Object.prototype.hasOwnProperty.call(DISCOUNTS, cleanCode)) {
      return {
        valid: false,
        code: cleanCode,
        message: MESSAGES.DISCOUNT_INVALID,
        isEmpty: false,
      };
    }

    const rule = DISCOUNTS[cleanCode];

    if (
      typeof rentalFee !== "number" ||
      isNaN(rentalFee) ||
      rentalFee <= 0 ||
      rentalFee < rule.minRentalFee
    ) {
      return {
        valid: false,
        code: cleanCode,
        message: MESSAGES.DISCOUNT_NOT_ELIGIBLE,
        isEmpty: false,
      };
    }

    return {
      valid: true,
      code: cleanCode,
      message: MESSAGES.DISCOUNT_SUCCESS,
      isEmpty: false,
    };
  }

  /**
   * Tính số tiền được giảm dựa trên tiền thuê xe gốc và mã giảm giá
   * @param {number} rentalFee
   * @param {string} rawCode
   * @returns {number}
   */
  function calculateDiscount(rentalFee, rawCode) {
    if (typeof rentalFee !== "number" || isNaN(rentalFee) || rentalFee <= 0) {
      return 0;
    }

    const check = validateDiscountCode(rawCode, rentalFee);
    if (!check.valid || check.isEmpty) {
      return 0;
    }

    const rule = DISCOUNTS[check.code];
    let discountAmount = 0;

    if (rule.type === "percent") {
      discountAmount = Math.round(rentalFee * rule.value);
      if (discountAmount > rule.maxDiscount) {
        discountAmount = rule.maxDiscount;
      }
    } else if (rule.type === "fixed") {
      discountAmount = rule.value;
    }

    if (discountAmount > rentalFee) {
      discountAmount = rentalFee;
    }

    return discountAmount;
  }

  const Discount = {
    validateDiscountCode,
    calculateDiscount,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Discount;
  }
  root.Discount = Discount;
  root.validateDiscountCode = validateDiscountCode;
  root.calculateDiscount = calculateDiscount;
})(typeof globalThis !== "undefined" ? globalThis : window);
