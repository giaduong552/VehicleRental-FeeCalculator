# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: blackbox.spec.js >> Additional Service Fees >> TC32 - service-insurance
- Location: tests\blackbox.spec.js:124:5

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  getByTestId('inv-total-payment')
Expected: "340.000đ"
Received: "360.000đ"
Timeout:  5000ms

Call log:
  - Expect "toHaveText" getByTestId('inv-total-payment') with timeout 5000ms
  - waiting for getByTestId('inv-total-payment')
    14 × locator resolved to <span id="inv-total-payment" data-testid="inv-total-payment" class="vrc-invoice-total-value">360.000đ</span>
       - unexpected value "360.000đ"

```

```yaml
- text: 360.000đ
```

# Test source

```ts
  1   | const { test, expect } = require("./extension.fixture");
  2   | const rates = {
  3   |   manual_bike: 120000,
  4   |   scooter: 180000,
  5   |   car_4: 700000,
  6   |   car_7: 1000000,
  7   | };
  8   | const money = (value) => `${value.toLocaleString("vi-VN")}đ`;
  9   | async function enterRental(page, vehicle, days) {
  10  |   await page.getByTestId("vehicle-select").selectOption(vehicle);
  11  |   await page.getByTestId("rental-days").fill(days);
  12  | }
  13  | async function expectInvoice(page, total) {
  14  |   await page.getByTestId("calculate-btn").click();
  15  |   await expect(page.getByTestId("invoice-content")).toBeVisible();
> 16  |   await expect(page.getByTestId("inv-total-payment")).toHaveText(money(total));
      |                                                       ^ Error: expect(locator).toHaveText(expected) failed
  17  | }
  18  | const boundaryCases = [
  19  |   ["TC01", "manual_bike", "-1", null],
  20  |   ["TC02", "manual_bike", "0", null],
  21  |   ["TC03", "manual_bike", "1", 120000],
  22  |   ["TC04", "manual_bike", "2", 240000],
  23  |   ["TC05", "manual_bike", "29", 3480000],
  24  |   ["TC06", "manual_bike", "30", 3600000],
  25  |   ["TC07", "manual_bike", "31", null],
  26  |   ["TC08", "scooter", "0", null],
  27  |   ["TC09", "scooter", "1", 180000],
  28  |   ["TC10", "scooter", "30", 5400000],
  29  |   ["TC11", "scooter", "31", null],
  30  |   ["TC12", "car_4", "0", null],
  31  |   ["TC13", "car_4", "1", 700000],
  32  |   ["TC14", "car_4", "30", 21000000],
  33  |   ["TC15", "car_4", "31", null],
  34  |   ["TC16", "car_7", "0", null],
  35  |   ["TC17", "car_7", "1", 1000000],
  36  |   ["TC18", "car_7", "30", 30000000],
  37  |   ["TC19", "car_7", "31", null],
  38  |   ["TC20", "manual_bike", "", null],
  39  |   ["TC21", "manual_bike", "1.5", null],
  40  |   ["TC22", "manual_bike", "abc", null],
  41  |   ["TC23", "scooter", "-1", null],
  42  |   ["TC24", "car_4", "29", 20300000],
  43  |   ["TC25", "car_7", "29", 29000000],
  44  | ];
  45  | 
  46  | const invalidMessage = (days) => {
  47  |   if (days === "") return "Vui lòng nhập số ngày thuê.";
  48  |   if (days === "0" || days === "-1")
  49  |     return "Số ngày thuê phải lớn hơn hoặc bằng 1.";
  50  |   if (days === "31") return "Số ngày thuê không được vượt quá 30 ngày.";
  51  |   if (days === "1.5") return "Số ngày thuê phải là số nguyên.";
  52  |   return "Số ngày thuê không hợp lệ.";
  53  | };
  54  | 
  55  | test.describe("Boundary Value and Invalid Input Testing", () => {
  56  |   for (const [id, vehicle, days, expected] of boundaryCases) {
  57  |     test(`${id} - ${vehicle}, days=${days || "(empty)"}`, async ({
  58  |       extensionPage,
  59  |     }) => {
  60  |       await enterRental(extensionPage, vehicle, days);
  61  |       if (expected !== null) {
  62  |         await expectInvoice(extensionPage, expected);
  63  |       } else {
  64  |         await extensionPage.getByTestId("calculate-btn").click();
  65  |         await expect(extensionPage.getByTestId("days-error")).toHaveText(
  66  |           invalidMessage(days),
  67  |         );
  68  |         await expect(extensionPage.getByTestId("invoice-content")).toBeHidden();
  69  |       }
  70  |     });
  71  |   }
  72  | });
  73  | 
  74  | const discountCases = [
  75  |   ["TC26", "manual_bike", "1", "", 120000, null],
  76  |   ["TC27", "manual_bike", "1", "INVALID", null, "Mã giảm giá không hợp lệ."],
  77  |   ["TC28", "manual_bike", "1", "SALE10", 108000, null],
  78  |   ["TC29", "manual_bike", "1", "SALE20", 96000, null],
  79  |   [
  80  |     "TC30",
  81  |     "manual_bike",
  82  |     "1",
  83  |     "FIXED100",
  84  |     null,
  85  |     "Đơn thuê xe chưa đủ điều kiện áp dụng mã giảm giá.",
  86  |   ],
  87  |   ["TC31", "manual_bike", "5", "FIXED100", 500000, null],
  88  | ];
  89  | 
  90  | test.describe("Discount Code Processing", () => {
  91  |   for (const [id, vehicle, days, code, expected, error] of discountCases) {
  92  |     test(`${id} - discount ${code || "(empty)"}`, async ({ extensionPage }) => {
  93  |       await enterRental(extensionPage, vehicle, days);
  94  |       await extensionPage.getByTestId("discount-input").fill(code);
  95  |       await extensionPage.getByTestId("apply-discount-btn").click();
  96  |       if (error) {
  97  |         await expect(extensionPage.getByTestId("discount-message")).toHaveText(
  98  |           error,
  99  |         );
  100 |         await extensionPage.getByTestId("calculate-btn").click();
  101 |         await expect(extensionPage.getByTestId("invoice-content")).toBeHidden();
  102 |       } else {
  103 |         await expectInvoice(extensionPage, expected);
  104 |       }
  105 |     });
  106 |   }
  107 | });
  108 | 
  109 | const serviceCases = [
  110 |   ["TC32", "manual_bike", "2", ["service-insurance"], 340000],
  111 |   ["TC33", "manual_bike", "2", ["service-delivery"], 340000],
  112 |   ["TC34", "car_4", "1", ["service-driver"], 1000000],
  113 |   [
  114 |     "TC35",
  115 |     "car_4",
  116 |     "2",
```