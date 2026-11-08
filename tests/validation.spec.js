const { test, expect } = require("./extension.fixture");

const invalidCases = [
  {
    id: "TC07",
    days: "",
    error: "Vui lòng nhập số ngày thuê.",
  },
  {
    id: "TC08",
    days: "0",
    error: "Số ngày thuê phải lớn hơn hoặc bằng 1.",
  },
  {
    id: "TC09",
    days: "-1",
    error: "Số ngày thuê phải lớn hơn hoặc bằng 1.",
  },
  {
    id: "TC12",
    days: "31",
    error: "Số ngày thuê không được vượt quá 30 ngày.",
  },
  {
    id: "TC13",
    days: "1.5",
    error: "Số ngày thuê phải là số nguyên.",
  },
  {
    id: "TC14",
    days: "abc",
    error: "Số ngày thuê không hợp lệ.",
  },
];

for (const tc of invalidCases) {
  test(`${tc.id} - Invalid rental days`, async ({ extensionPage }) => {
    await extensionPage.getByTestId("vehicle-type").selectOption("motorbike");

    await extensionPage.getByTestId("rental-days").fill(tc.days);

    await extensionPage.getByTestId("calculate-button").click();

    await expect(extensionPage.getByTestId("rental-days-error")).toHaveText(
      tc.error,
    );
  });
}
