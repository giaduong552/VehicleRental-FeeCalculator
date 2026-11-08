(function (root) {
  const Constants =
    typeof module !== "undefined" && module.exports
      ? require("./constants.js")
      : root.Constants;

  const { VEHICLES, RENTAL_LIMITS, MESSAGES } = Constants;

  /**
   * Kiểm tra loại xe đã chọn
   * @param {string} vehicleId
   * @returns {{ valid: boolean, error: string, vehicle: object|null }}
   */
  function validateVehicle(vehicleId) {
    if (typeof vehicleId !== "string" || vehicleId.trim() === "") {
      return { valid: false, error: MESSAGES.VEHICLE_REQUIRED, vehicle: null };
    }
    const key = vehicleId.trim();
    if (!Object.prototype.hasOwnProperty.call(VEHICLES, key)) {
      return { valid: false, error: MESSAGES.VEHICLE_REQUIRED, vehicle: null };
    }
    return { valid: true, error: "", vehicle: VEHICLES[key] };
  }

  /**
   * Kiểm tra số ngày thuê hợp lệ (1 -> 30, số nguyên dương, không ép kiểu sai)
   * @param {string|number} rawInput
   * @returns {{ valid: boolean, error: string, days: number|null }}
   */
  function validateRentalDays(rawInput) {
    if (rawInput === null || rawInput === undefined) {
      return { valid: false, error: MESSAGES.DAYS_REQUIRED, days: null };
    }

    const str = String(rawInput);

    // Để trống hoặc chỉ có khoảng trắng
    if (str.trim() === "") {
      return { valid: false, error: MESSAGES.DAYS_REQUIRED, days: null };
    }

    // Chứa khoảng trắng ở đầu, cuối hoặc ở giữa (theo mục 11: Nhập dữ liệu có khoảng trắng -> không hợp lệ)
    if (/\s/.test(str)) {
      return { valid: false, error: MESSAGES.DAYS_INVALID, days: null };
    }

    // Kiểm tra định dạng số thập phân (ví dụ: 2.5, 3,5, -1.5, 1.0)
    if (/^[+-]?\d+[.,]\d+$/.test(str)) {
      return { valid: false, error: MESSAGES.DAYS_INTEGER, days: null };
    }

    // Kiểm tra định dạng số nguyên (chỉ gồm dấu +/- tùy chọn và các chữ số)
    if (!/^[+-]?\d+$/.test(str)) {
      return { valid: false, error: MESSAGES.DAYS_INVALID, days: null };
    }

    const num = Number(str);

    if (!Number.isSafeInteger(num)) {
      return { valid: false, error: MESSAGES.DAYS_INVALID, days: null };
    }

    if (num < RENTAL_LIMITS.MIN_DAYS) {
      return { valid: false, error: MESSAGES.DAYS_MIN, days: null };
    }

    if (num > RENTAL_LIMITS.MAX_DAYS) {
      return { valid: false, error: MESSAGES.DAYS_MAX, days: null };
    }

    return { valid: true, error: "", days: num };
  }

  const Validation = {
    validateVehicle,
    validateRentalDays,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Validation;
  }
  root.Validation = Validation;
  root.validateVehicle = validateVehicle;
  root.validateRentalDays = validateRentalDays;
})(typeof globalThis !== "undefined" ? globalThis : window);
