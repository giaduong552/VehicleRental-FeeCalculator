const { test, expect } = require("@playwright/test");
const {
  validateDiscountCode,
  calculateDiscount,
} = require("../js/discount.js");

test.describe("Discount Code Logic Tests", () => {
  test("TC15 - Không nhập mã giảm giá: hợp lệ, không báo lỗi, giảm 0đ", () => {
    const res = validateDiscountCode("", 1000000);
    expect(res.valid).toBe(true);
    expect(res.isEmpty).toBe(true);
    expect(calculateDiscount(1000000, "")).toBe(0);
  });

  test("TC16 - Mã giảm giá không tồn tại (WELCOME50)", () => {
    const res = validateDiscountCode("WELCOME50", 1000000);
    expect(res.valid).toBe(false);
    expect(res.message).toBe("Mã giảm giá không hợp lệ.");
    expect(calculateDiscount(1000000, "WELCOME50")).toBe(0);
  });

  test("TC17 - Mã SALE10 không phân biệt hoa thường & tự cắt khoảng trắng", () => {
    const res = validateDiscountCode("  sale10  ", 2100000);
    expect(res.valid).toBe(true);
    expect(res.code).toBe("SALE10");
    expect(res.message).toBe("Áp dụng mã giảm giá thành công.");
    expect(calculateDiscount(2100000, "  sale10  ")).toBe(210000);
  });

  test("TC18 - Mã SALE10 chạm trần giảm tối đa 500.000đ", () => {
    // Tiền thuê 7.000.000đ -> 10% = 700.000đ -> chỉ giảm tối đa 500.000đ
    expect(calculateDiscount(7000000, "SALE10")).toBe(500000);
  });

  test("TC19 - Mã SALE20 giảm 20% dưới mức trần", () => {
    // Tiền thuê 2.000.000đ -> 20% = 400.000đ
    expect(calculateDiscount(2000000, "SALE20")).toBe(400000);
  });

  test("TC20 - Mã SALE20 chạm trần giảm tối đa 1.000.000đ", () => {
    // Tiền thuê 8.000.000đ -> 20% = 1.600.000đ -> chỉ giảm tối đa 1.000.000đ
    expect(calculateDiscount(8000000, "SALE20")).toBe(1000000);
  });

  test("TC21 - Mã FIXED100 khi tiền thuê xe dưới 500.000đ (499.000đ -> Không đủ điều kiện)", () => {
    const res = validateDiscountCode("FIXED100", 499000);
    expect(res.valid).toBe(false);
    expect(res.message).toBe(
      "Đơn thuê xe chưa đủ điều kiện áp dụng mã giảm giá.",
    );
    expect(calculateDiscount(499000, "FIXED100")).toBe(0);
  });

  test("TC22 - Mã FIXED100 tại đúng biên 500.000đ -> Giảm 100.000đ", () => {
    const res = validateDiscountCode("FIXED100", 500000);
    expect(res.valid).toBe(true);
    expect(calculateDiscount(500000, "FIXED100")).toBe(100000);
  });
});
