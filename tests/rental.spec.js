const { test, expect } = require("./extension.fixture");

const cases = [
  {
    id: "TC01",
    vehicle: "manual_bike",
    days: "1",
    expected: "120.000đ",
  },
  {
    id: "TC02",
    vehicle: "manual_bike",
    days: "5",
    expected: "600.000đ",
  },
  {
    id: "TC03",
    vehicle: "scooter",
    days: "3",
    expected: "540.000đ",
  },
  {
    id: "TC04",
    vehicle: "car_4",
    days: "2",
    expected: "1.400.000đ",
  },
  {
    id: "TC05",
    vehicle: "car_7",
    days: "4",
    expected: "4.000.000đ",
  },
  {
    id: "TC06",
    vehicle: "manual_bike",
    days: "30",
    expected: "3.600.000đ",
  },
];

for (const tc of cases) {
  test(`${tc.id} - Rental fee calculation`, async ({ extensionPage }) => {
    // Chon loai xe
    await extensionPage.getByTestId("vehicle-select").selectOption(tc.vehicle);

    // Nhap so ngay thue
    await extensionPage.getByTestId("rental-days").fill(tc.days);

    // Nhan nut tinh phi
    await extensionPage.getByTestId("calculate-btn").click();

    // Kiem tra hoa don hien thi
    await expect(extensionPage.getByTestId("invoice-content")).toBeVisible();

    // Kiem tra tong thanh toan
    await expect(extensionPage.getByTestId("inv-total-payment")).toHaveText(
      tc.expected,
    );
  });
}
