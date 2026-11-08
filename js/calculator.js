(function (root) {
  const Constants =
    typeof module !== "undefined" && module.exports
      ? require("./constants.js")
      : root.Constants;
  const Validation =
    typeof module !== "undefined" && module.exports
      ? require("./validation.js")
      : root.Validation;
  const Discount =
    typeof module !== "undefined" && module.exports
      ? require("./discount.js")
      : root.Discount;

  const { VEHICLES, SERVICES } = Constants;
  const { validateVehicle, validateRentalDays } = Validation;
  const { validateDiscountCode, calculateDiscount } = Discount;

  /**
   * Tính tiền thuê xe gốc = Đơn giá loại xe × Số ngày thuê
   * @param {string} vehicleId
   * @param {number} days
   * @returns {number}
   */
  function calculateRentalFee(vehicleId, days) {
    const vCheck = validateVehicle(vehicleId);
    const dCheck = validateRentalDays(days);
    if (!vCheck.valid || !dCheck.valid) {
      return 0;
    }
    return vCheck.vehicle.price * dCheck.days;
  }

  /**
   * Tính phí bảo hiểm xe = 50.000 × Số ngày thuê
   * @param {boolean} isSelected
   * @param {number} days
   * @returns {number}
   */
  function calculateInsuranceFee(isSelected, days) {
    if (!isSelected) return 0;
    const dCheck = validateRentalDays(days);
    if (!dCheck.valid) return 0;
    return SERVICES.INSURANCE_PER_DAY * dCheck.days;
  }

  /**
   * Tính phí giao xe tận nơi = 100.000đ cố định
   * @param {boolean} isSelected
   * @returns {number}
   */
  function calculateDeliveryFee(isSelected) {
    return isSelected ? SERVICES.DELIVERY_FLAT : 0;
  }

  /**
   * Tính phí thuê tài xế = 300.000 × Số ngày thuê (chỉ áp dụng cho ô tô)
   * @param {boolean} isSelected
   * @param {string} vehicleId
   * @param {number} days
   * @returns {number}
   */
  function calculateDriverFee(isSelected, vehicleId, days) {
    if (!isSelected) return 0;
    const vCheck = validateVehicle(vehicleId);
    const dCheck = validateRentalDays(days);
    if (!vCheck.valid || !dCheck.valid) return 0;
    if (vCheck.vehicle.type !== "car") return 0;
    return SERVICES.DRIVER_PER_DAY * dCheck.days;
  }

  /**
   * Tính tổng thanh toán và trả về toàn bộ chi tiết hóa đơn
   * @param {object} params
   * @returns {object}
   */
  function calculateTotalFee(params = {}) {
    const {
      vehicleId = "",
      rentalDays = "",
      insurance = false,
      delivery = false,
      driver = false,
      discountCode = "",
    } = params;

    const vCheck = validateVehicle(vehicleId);
    const dCheck = validateRentalDays(rentalDays);

    if (!vCheck.valid || !dCheck.valid) {
      return {
        valid: false,
        errors: {
          vehicle: vCheck.error,
          rentalDays: dCheck.error,
        },
        data: null,
      };
    }

    const days = dCheck.days;
    const vehicle = vCheck.vehicle;
    const rentalFee = calculateRentalFee(vehicle.id, days);

    const insuranceFee = calculateInsuranceFee(Boolean(insurance), days);
    const deliveryFee = calculateDeliveryFee(Boolean(delivery));
    const driverFee = calculateDriverFee(Boolean(driver), vehicle.id, days);
    const totalExtraFee = insuranceFee + deliveryFee + driverFee;

    const discountValidation = validateDiscountCode(discountCode, rentalFee);
    if (!discountValidation.valid && !discountValidation.isEmpty) {
      return {
        valid: false,
        errors: {
          vehicle: "",
          rentalDays: "",
          discount: discountValidation.message,
        },
        data: null,
      };
    }

    const appliedCode =
      discountValidation.valid && !discountValidation.isEmpty
        ? discountValidation.code
        : "";
    const discountAmount = appliedCode
      ? calculateDiscount(rentalFee, appliedCode)
      : 0;

    const totalPayment = Math.max(
      0,
      rentalFee + totalExtraFee - discountAmount,
    );

    return {
      valid: true,
      errors: {
        vehicle: "",
        rentalDays: "",
        discount: "",
      },
      data: {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        unitPrice: vehicle.price,
        rentalDays: days,
        rentalFee,
        insuranceFee,
        deliveryFee,
        driverFee,
        totalExtraFee,
        discountCode: appliedCode || "Không áp dụng",
        discountAmount,
        totalPayment,
      },
    };
  }

  /**
   * Trả về trạng thái mặc định ban đầu của bộ tính phí
   * @returns {object}
   */
  function resetCalculator() {
    return {
      vehicleId: "",
      rentalDays: "",
      insurance: false,
      delivery: false,
      driver: false,
      driverDisabled: true,
      discountCode: "",
      appliedDiscountCode: "",
      errors: {
        vehicle: "",
        rentalDays: "",
        discount: "",
      },
      discountStatus: {
        type: "",
        message: "",
      },
      invoice: null,
    };
  }

  const Calculator = {
    calculateRentalFee,
    calculateInsuranceFee,
    calculateDeliveryFee,
    calculateDriverFee,
    calculateTotalFee,
    resetCalculator,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Calculator;
  }
  root.Calculator = Calculator;
  root.calculateRentalFee = calculateRentalFee;
  root.calculateInsuranceFee = calculateInsuranceFee;
  root.calculateDeliveryFee = calculateDeliveryFee;
  root.calculateDriverFee = calculateDriverFee;
  root.calculateTotalFee = calculateTotalFee;
  root.resetCalculator = resetCalculator;
})(typeof globalThis !== "undefined" ? globalThis : window);
