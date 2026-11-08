const { test, expect } = require("./extension.fixture");
const rates = {
  manual_bike: 120000,
  scooter: 180000,
  car_4: 700000,
  car_7: 1000000,
};
const money = (value) => `${value.toLocaleString("vi-VN")}đ`;
async function enterRental(page, vehicle, days) {
  await page.getByTestId("vehicle-select").selectOption(vehicle);
  await page.getByTestId("rental-days").fill(days);
}
async function expectInvoice(page, total) {
  await page.getByTestId("calculate-btn").click();
  await expect(page.getByTestId("invoice-content")).toBeVisible();
  await expect(page.getByTestId("inv-total-payment")).toHaveText(money(total));
}
const boundaryCases = [
  ["TC01", "manual_bike", "-1", null],
  ["TC02", "manual_bike", "0", null],
  ["TC03", "manual_bike", "1", 120000],
  ["TC04", "manual_bike", "2", 240000],
  ["TC05", "manual_bike", "29", 3480000],
  ["TC06", "manual_bike", "30", 3600000],
  ["TC07", "manual_bike", "31", null],
  ["TC08", "scooter", "0", null],
  ["TC09", "scooter", "1", 180000],
  ["TC10", "scooter", "30", 5400000],
  ["TC11", "scooter", "31", null],
  ["TC12", "car_4", "0", null],
  ["TC13", "car_4", "1", 700000],
  ["TC14", "car_4", "30", 21000000],
  ["TC15", "car_4", "31", null],
  ["TC16", "car_7", "0", null],
  ["TC17", "car_7", "1", 1000000],
  ["TC18", "car_7", "30", 30000000],
  ["TC19", "car_7", "31", null],
  ["TC20", "manual_bike", "", null],
  ["TC21", "manual_bike", "1.5", null],
  ["TC22", "manual_bike", "abc", null],
  ["TC23", "scooter", "-1", null],
  ["TC24", "car_4", "29", 20300000],
  ["TC25", "car_7", "29", 29000000],
];

const invalidMessage = (days) => {
  if (days === "") return "Vui lòng nhập số ngày thuê.";
  if (days === "0" || days === "-1")
    return "Số ngày thuê phải lớn hơn hoặc bằng 1.";
  if (days === "31") return "Số ngày thuê không được vượt quá 30 ngày.";
  if (days === "1.5") return "Số ngày thuê phải là số nguyên.";
  return "Số ngày thuê không hợp lệ.";
};

test.describe("Boundary Value and Invalid Input Testing", () => {
  for (const [id, vehicle, days, expected] of boundaryCases) {
    test(`${id} - ${vehicle}, days=${days || "(empty)"}`, async ({
      extensionPage,
    }) => {
      await enterRental(extensionPage, vehicle, days);
      if (expected !== null) {
        await expectInvoice(extensionPage, expected);
      } else {
        await extensionPage.getByTestId("calculate-btn").click();
        await expect(extensionPage.getByTestId("days-error")).toHaveText(
          invalidMessage(days),
        );
        await expect(extensionPage.getByTestId("invoice-content")).toBeHidden();
      }
    });
  }
});

const discountCases = [
  ["TC26", "manual_bike", "1", "", 120000, null],
  ["TC27", "manual_bike", "1", "INVALID", null, "Mã giảm giá không hợp lệ."],
  ["TC28", "manual_bike", "1", "SALE10", 108000, null],
  ["TC29", "manual_bike", "1", "SALE20", 96000, null],
  [
    "TC30",
    "manual_bike",
    "1",
    "FIXED100",
    null,
    "Đơn thuê xe chưa đủ điều kiện áp dụng mã giảm giá.",
  ],
  ["TC31", "manual_bike", "5", "FIXED100", 500000, null],
];

test.describe("Discount Code Processing", () => {
  for (const [id, vehicle, days, code, expected, error] of discountCases) {
    test(`${id} - discount ${code || "(empty)"}`, async ({ extensionPage }) => {
      await enterRental(extensionPage, vehicle, days);
      await extensionPage.getByTestId("discount-input").fill(code);
      await extensionPage.getByTestId("apply-discount-btn").click();
      if (error) {
        await expect(extensionPage.getByTestId("discount-message")).toHaveText(
          error,
        );
        await extensionPage.getByTestId("calculate-btn").click();
        await expect(extensionPage.getByTestId("invoice-content")).toBeHidden();
      } else {
        await expectInvoice(extensionPage, expected);
      }
    });
  }
});

const serviceCases = [
  ["TC32", "manual_bike", "2", ["service-insurance"], 340000],
  ["TC33", "manual_bike", "2", ["service-delivery"], 340000],
  ["TC34", "car_4", "1", ["service-driver"], 1000000],
  [
    "TC35",
    "car_4",
    "2",
    ["service-insurance", "service-delivery", "service-driver"],
    2200000,
  ],
];

test.describe("Additional Service Fees", () => {
  for (const [id, vehicle, days, services, expected] of serviceCases) {
    test(`${id} - ${services.join(", ")}`, async ({ extensionPage }) => {
      await enterRental(extensionPage, vehicle, days);
      for (const service of services) {
        await extensionPage.getByTestId(service).check({ force: true });
      }
      await expectInvoice(extensionPage, expected);
    });
  }
});
