(function (root) {
  const VEHICLES = {
    manual_bike: {
      id: "manual_bike",
      name: "Xe số",
      price: 120000,
      type: "motorbike",
    },
    scooter: {
      id: "scooter",
      name: "Xe tay ga",
      price: 190000,
      type: "motorbike",
    },
    car_4: {
      id: "car_4",
      name: "Ô tô 4 chỗ",
      price: 700000,
      type: "car",
    },
    car_7: {
      id: "car_7",
      name: "Ô tô 7 chỗ",
      price: 1000000,
      type: "car",
    },
  };

  const SERVICES = {
    INSURANCE_PER_DAY: 60000,
    DELIVERY_FLAT: 100000,
    DRIVER_PER_DAY: 300000,
  };

  const RENTAL_LIMITS = {
    MIN_DAYS: 1,
    MAX_DAYS: 30,
  };

  const DISCOUNTS = {
    SALE10: {
      code: "SALE10",
      type: "percent",
      value: 0.05,
      maxDiscount: 500000,
      minRentalFee: 0,
    },
    SALE20: {
      code: "SALE20",
      type: "percent",
      value: 0.2,
      maxDiscount: 1000000,
      minRentalFee: 0,
    },
    FIXED100: {
      code: "FIXED100",
      type: "fixed",
      value: 100000,
      maxDiscount: 100000,
      minRentalFee: 500000,
    },
  };

  const MESSAGES = {
    VEHICLE_REQUIRED: "Vui lòng chọn loại xe.",
    DAYS_REQUIRED: "Vui lòng nhập số ngày thuê.",
    DAYS_MIN: "Số ngày thuê phải lớn hơn hoặc bằng 1.",
    DAYS_MAX: "Số ngày thuê không được vượt quá 30 ngày.",
    DAYS_INTEGER: "Số ngày thuê phải là số nguyên.",
    DAYS_INVALID: "Số ngày thuê không hợp lệ.",
    DISCOUNT_SUCCESS: "Áp dụng mã giảm giá thành công.",
    DISCOUNT_INVALID: "Mã giảm giá không hợp lệ.",
    DISCOUNT_NOT_ELIGIBLE: "Đơn thuê xe chưa đủ điều kiện áp dụng mã giảm giá.",
  };

  const Constants = {
    VEHICLES,
    SERVICES,
    RENTAL_LIMITS,
    DISCOUNTS,
    MESSAGES,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Constants;
  }
  root.Constants = Constants;
})(typeof globalThis !== "undefined" ? globalThis : window);
