import { BarChart } from "@mantine/charts";

const months: { [key: number]: string } = {
  0: "January",
  1: "February",
  2: "March",
  3: "April",
  4: "May",
  5: "June",
  6: "July",
  7: "August",
  8: "September",
  9: "October",
  10: "November",
  11: "December",
};
export const getNextMonth = (month: number, year: number) => {
  if (month === 11) return { month: 0, year: year + 1 };
  else return { month: month + 1, year };
};
export const getMonthName = (month: number) => {
  return months[month];
};
export const getPreviousMonths = (lookbackMonths: number) => {
  const d = new Date();
  const month = d.getMonth();
  const year = d.getFullYear();
  const monthsYears: Array<{
    month: number;
    year: number;
  }> = [
    {
      month,
      year,
    },
  ];
  for (let i = 0; i < lookbackMonths; i++) {
    d.setMonth(d.getMonth() - 1);
    monthsYears.push({ month: d.getMonth(), year: d.getFullYear() });
  }
  return monthsYears;
};
const graphColors = [
  "red.6",
  "gray.6",
  "pink.6",
  "grape.6",
  "violet.6",
  "indigo.6",
  "blue.6",
  "cyan.6",
  "teal.6",
  "green.6",
  "lime.6",
  "yellow.6",
  "orange",
  "red.2",
  "gray.2",
  "pink.2",
  "grape.2",
  "violet.2",
  "indigo.2",
  "blue.2",
  "cyan.2",
  "teal.2",
  "green.2",
  "lime.2",
  "yellow.2",
  "orange.2",
].reverse();
export function InstallationsBarChart({
  data,
}: {
  data: Array<{
    month: number;
    year: number;
    monthName: string;
    installation: {
      [id: string]: number;
    };
  }>;
}) {
  return (
    <BarChart
      h={300}
      data={[
        ...data.map((month) => ({
          month: `${month.monthName} ${month.year}`,
          ...month.installation,
        })),
      ].reverse()}
      dataKey="month"
      type="stacked"
      series={data
        .flatMap((month) =>
          Object.keys(month.installation).map((key) => ({
            name: key,
            color: graphColors.pop() || "pink.9",
          }))
        )
        .filter((v, i, a) => a.findIndex((t) => t.name === v.name) === i)}
      xAxisLabel="Month"
      yAxisLabel="Active Installations"
    />
  );
}
