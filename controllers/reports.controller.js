import { User } from "../models/users.model.js";
import { Expenses } from "../models/expenses.model.js";
import moment from "moment-timezone";
const now = new Date();

const peruOffset = -5 * 60;
const peruTime = new Date(now.getTime() + peruOffset * 60 * 1000);
const currentYear = peruTime.getUTCFullYear();
const currentMonth = peruTime.getUTCMonth() + 1;
const currentDay = peruTime.getUTCDate();
const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
function getPeruUTCDates(year, month) {
  const isCurrentMonth = month === currentMonth && year === currentYear;

  const startUTC = new Date(Date.UTC(year, month - 1, 1, 5, 0));

  const endUTCDay = isCurrentMonth ? currentDay + 1 : 1;
  const endUTCMonth = isCurrentMonth ? month : month + 1;
  const endUTC = new Date(Date.UTC(year, endUTCMonth - 1, endUTCDay, 5, 0, 0));

  return { startUTC, endUTC };
}

function getDaysArray(year, month) {
  const isCurrentMonth = month === currentMonth && year === currentYear;

  const daysInMonth = isCurrentMonth
    ? currentDay
    : new Date(year, month, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
}
const calculateBalance = (incomesArr, expensesArr) => {
  return incomesArr.map((income, index) => {
    const expensesEntry = expensesArr[index];
    return {
      label: income.label,
      val1: income.val1 - expensesEntry.val1,
      val2: income.val2 - expensesEntry.val2,
    };
  });
};
const calculateBalanceStaticts = (incomesArr, expensesArr) => {
  return incomesArr.map((income, index) => {
    const expensesEntry = expensesArr[index];
    return {
      label: income.label,
      price: income.price - expensesEntry.price,
    };
  });
};

const getComparativeYear = async (idMyUser) => {
  const processAnnualAggregation = (aggregationResults) => {
    const result = { current: {}, previous: {} };

    aggregationResults.forEach((item) => {
      const yearType = item._id.year;
      const month = item._id.month;
      result[yearType][month] = item.totalAmount;
    });
    return Array.from({ length: 12 }, (_, i) => {
      const monthNumber = (i + 1).toString().padStart(2, "0");
      return {
        label: months[i],
        val1: result.current[monthNumber] || 0,
        val2: result.previous[monthNumber] || 0,
      };
    });
  };

  const now = moment().tz("America/Lima");
  const currentYearStart = now.clone().startOf("year");
  const currentYearEnd = now.clone().endOf("year");
  const previousYearStart = currentYearStart.clone().subtract(1, "year");
  const previousYearEnd = previousYearStart.clone().endOf("year");

  const matchStart = previousYearStart.toDate();
  const matchEnd = currentYearEnd.toDate();

  const [usersAgg, expensesAgg] = await Promise.all([
    User.aggregate([
      {
        $match: {
          createdAt: { $gte: matchStart, $lte: matchEnd },
          idMyUser: idMyUser,
        },
      },
      {
        $project: {
          month: {
            $dateToString: {
              format: "%m",
              date: "$createdAt",
              timezone: "America/Lima",
            },
          },
          year: {
            $cond: [
              { $gte: ["$createdAt", currentYearStart.utc().toDate()] },
              "current",
              "previous",
            ],
          },
          price: 1,
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalAmount: { $sum: "$price" },
        },
      },
    ]),
    Expenses.aggregate([
      {
        $match: {
          createdAt: { $gte: matchStart, $lte: matchEnd },
          idMyUser: idMyUser,
        },
      },
      {
        $project: {
          month: {
            $dateToString: {
              format: "%m",
              date: "$createdAt",
              timezone: "America/Lima",
            },
          },
          year: {
            $cond: [
              { $gte: ["$createdAt", currentYearStart.utc().toDate()] },
              "current",
              "previous",
            ],
          },
          price: 1,
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalAmount: { $sum: "$price" },
        },
      },
    ]),
  ]);
  const incomes = processAnnualAggregation(usersAgg);
  const expenses = processAnnualAggregation(expensesAgg);

  const balance = calculateBalance(incomes, expenses);

  return { incomes: incomes, expenses: expenses, balance: balance };
};

const getComparativeMonth = async (idMyUser) => {
  const processMonthlyAggregation = (aggregationResults) => {
    const result = { current: {}, previous: {} };

    // Inicializa los objetos para cada semana
    const weeks = ["S1", "S2", "S3", "S4", "S5"];
    weeks.forEach((week) => {
      result.current[week] = 0;
      result.previous[week] = 0;
    });

    // Ahora es seguro asignar valores
    aggregationResults.forEach((item) => {
      if (item._id && item._id.month && item._id.weekOfMonth) {
        const monthType = item._id.month;
        const weekLabel = item._id.weekOfMonth.toString();

        // Forma segura de asignar
        if (result[monthType]) {
          result[monthType]["S" + weekLabel] = item.totalAmount;
        }
      }
    });

    return weeks.map((week) => ({
      label: week,
      val1: result.current[week] || 0,
      val2: result.previous[week] || 0,
    }));
  };

  const now = moment().tz("America/Lima");
  const currentMonthStart = now.clone().startOf("month");
  const currentMonthEnd = now.clone().endOf("month");
  const previousMonthStart = currentMonthStart.clone().subtract(1, "month");
  const previousMonthEnd = currentMonthStart.clone().subtract(1, "days");

  const previousMatchStart = previousMonthStart.utc().toDate();
  const previousMatchEnd = previousMonthEnd.utc().toDate();
  const currentMatchEnd = currentMonthEnd.utc().toDate();
  const currentMatchStart = currentMonthStart.utc().toDate();

  const [usersAgg, expensesAgg] = await Promise.all([
    User.aggregate([
      {
        $match: {
          $or: [
            { createdAt: { $gte: currentMatchStart, $lte: currentMatchEnd } },
            {
              createdAt: { $gte: previousMatchStart, $lte: previousMatchEnd },
            },
          ],
          idMyUser: idMyUser,
        },
      },
      {
        $project: {
          weekOfMonth: {
            $let: {
              vars: {
                dateInPeru: {
                  $dateToParts: {
                    date: "$createdAt",
                    timezone: "America/Lima",
                  },
                },
              },
              in: {
                $add: [
                  {
                    $floor: {
                      $divide: [{ $subtract: ["$$dateInPeru.day", 1] }, 7],
                    },
                  },
                  1,
                ],
              },
            },
          },
          month: {
            $cond: [
              {
                $gte: ["$createdAt", currentMatchStart],
              },
              "current",
              "previous",
            ],
          },
          price: 1,
        },
      },
      {
        $group: {
          _id: { month: "$month", weekOfMonth: "$weekOfMonth" },
          totalAmount: { $sum: "$price" },
        },
      },
    ]),
    Expenses.aggregate([
      {
        $match: {
          $or: [
            { createdAt: { $gte: currentMatchStart, $lte: currentMatchEnd } },
            {
              createdAt: { $gte: previousMatchStart, $lte: previousMatchEnd },
            },
          ],
          idMyUser: idMyUser,
        },
      },
      {
        $project: {
          weekOfMonth: {
            $let: {
              vars: {
                dateInPeru: {
                  $dateToParts: {
                    date: "$createdAt",
                    timezone: "America/Lima",
                  },
                },
              },
              in: {
                $add: [
                  {
                    $floor: {
                      $divide: [{ $subtract: ["$$dateInPeru.day", 1] }, 7],
                    },
                  },
                  1,
                ],
              },
            },
          },
          month: {
            $cond: [
              {
                $gte: ["$createdAt", currentMatchStart],
              },
              "current",
              "previous",
            ],
          },
          price: 1,
        },
      },
      {
        $group: {
          _id: { month: "$month", weekOfMonth: "$weekOfMonth" },
          totalAmount: { $sum: "$price" },
        },
      },
    ]),
  ]);

  const incomes = processMonthlyAggregation(usersAgg);
  const expenses = processMonthlyAggregation(expensesAgg);
  const balance = calculateBalance(incomes, expenses);
  return { incomes: incomes, expenses: expenses, balance: balance };
};
const getComparativeWeek = async (idMyUser) => {
  const processAggregation = (aggregationResults) => {
    const result = { current: {}, previous: {} };
    aggregationResults.forEach((item) => {
      const weekType = item._id.week;
      const dayNumber = item._id.dayOfWeek;
      result[weekType][dayNumber] = item.totalAmount;
    });

    const days = [
      { number: "1", label: "Lunes" },
      { number: "2", label: "Martes" },
      { number: "3", label: "Miercoles" },
      { number: "4", label: "Jueves" },
      { number: "5", label: "Viernes" },
      { number: "6", label: "Sabado" },
      { number: "7", label: "Domingo" },
    ];

    return days.map((day) => ({
      label: day.label,
      val1: result.current[day.number] || 0,
      val2: result.previous[day.number] || 0,
    }));
  };
  const now = moment().tz("America/Lima");
  const currentWeekStart = now.clone().startOf("isoWeek");
  const currentWeekEnd = currentWeekStart.clone().endOf("isoWeek");

  const previousWeekStart = currentWeekStart.clone().subtract(1, "week");
  const previousWeekEnd = previousWeekStart.clone().endOf("isoWeek");

  const matchStart = previousWeekStart.utc().toDate();
  const matchEnd = currentWeekEnd.utc().toDate();

  const [usersAgg, expensesAgg] = await Promise.all([
    User.aggregate([
      {
        $match: {
          createdAt: { $gte: matchStart, $lte: matchEnd },
          idMyUser: idMyUser,
        },
      },
      {
        $project: {
          dayOfWeek: {
            $dateToString: {
              format: "%u",
              date: "$createdAt",
              timezone: "America/Lima",
            },
          },
          week: {
            $cond: [
              {
                $gte: ["$createdAt", currentWeekStart.utc().toDate()],
              },
              "current",
              "previous",
            ],
          },
          price: 1,
        },
      },
      {
        $group: {
          _id: { week: "$week", dayOfWeek: "$dayOfWeek" },
          totalAmount: { $sum: "$price" },
        },
      },
    ]),
    Expenses.aggregate([
      {
        $match: {
          createdAt: { $gte: matchStart, $lte: matchEnd },
          idMyUser: idMyUser,
        },
      },
      {
        $project: {
          dayOfWeek: {
            $dateToString: {
              format: "%u",
              date: "$createdAt",
              timezone: "America/Lima",
            },
          },
          week: {
            $cond: [
              {
                $gte: ["$createdAt", currentWeekStart.utc().toDate()],
              },
              "current",
              "previous",
            ],
          },
          price: 1,
        },
      },
      {
        $group: {
          _id: { week: "$week", dayOfWeek: "$dayOfWeek" },
          totalAmount: { $sum: "$price" },
        },
      },
    ]),
  ]);

  const incomes = processAggregation(usersAgg);
  const expenses = processAggregation(expensesAgg);
  const balance = calculateBalance(incomes, expenses);
  return { incomes: incomes, expenses: expenses, balance: balance };
};

async function getComparativeData(req, res) {
  try {
    const { type } = req.query;
    const idMyUser = req.user.uid;
    let result;
    if (type === "yearly") {
      result = await getComparativeYear(idMyUser);
    } else if (type === "monthly") {
      result = await getComparativeMonth(idMyUser);
    } else if (type === "weekly") {
      result = await getComparativeWeek(idMyUser);
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getDataGraphic(req, res) {
  try {
    const idMyUser = req.user.uid;
    const { year, month } = req.query;
    const yearNumber = parseInt(year);
    const monthNumber = parseInt(month);
    let expenses;
    let incomes;
    let balance;
    if (monthNumber) {
      const { startUTC, endUTC } = getPeruUTCDates(yearNumber, monthNumber);
      const [userAggrregation, expensesAggregation] = await Promise.all([
        User.aggregate([
          {
            $match: {
              createdAt: { $gte: startUTC, $lt: endUTC },
              idMyUser: idMyUser,
            },
          },
          {
            $project: {
              dayInPeru: {
                $dateToString: {
                  format: "%d",
                  date: "$createdAt",
                  timezone: "America/Lima",
                },
              },
              price: 1,
            },
          },
          {
            $group: {
              _id: "$dayInPeru",
              totalAmount: { $sum: "$price" },
            },
          },
          {
            $project: {
              _id: 0,
              label: { $toInt: "$_id" },
              price: "$totalAmount",
            },
          },
          { $sort: { label: 1 } },
        ]),
        Expenses.aggregate([
          {
            $match: {
              createdAt: { $gte: startUTC, $lt: endUTC },
              idMyUser: idMyUser,
            },
          },
          {
            $project: {
              dayInPeru: {
                $dateToString: {
                  format: "%d",
                  date: "$createdAt",
                  timezone: "America/Lima",
                },
              },
              price: 1,
            },
          },
          {
            $group: {
              _id: "$dayInPeru",
              totalAmount: { $sum: "$price" },
            },
          },
          {
            $project: {
              _id: 0,
              label: { $toInt: "$_id" },
              price: "$totalAmount",
            },
          },
          { $sort: { label: 1 } },
        ]),
      ]);

      const userMap = new Map(
        userAggrregation.map((item) => [item.label, item.price])
      );
      const expensesMap = new Map(
        expensesAggregation.map((item) => [item.label, item.price])
      );

      const dayArray = getDaysArray(yearNumber, monthNumber);

      const usersResult = dayArray.map((day) => ({
        label: day,
        price: userMap.get(day) || 0,
      }));
      const expensesResult = dayArray.map((day) => ({
        label: day,
        price: expensesMap.get(day) || 0,
      }));
      const balanceResult = calculateBalanceStaticts(
        usersResult,
        expensesResult
      );

      expenses = expensesResult;
      incomes = usersResult;
      balance = balanceResult;
    } else {
      const now = moment().tz("America/Lima");
      const currentYear = now.year();
      const targetYear = yearNumber || currentYear;

      const startDate = moment.tz(`${targetYear}-01-01`, "America/Lima");
      let endDate;
      if (targetYear === currentYear) {
        endDate = now.endOf("month");
      } else {
        endDate = moment
          .tz(`${targetYear}-12-31`, "America/Lima")
          .endOf("year");
      }
      const matchFilter = {
        createdAt: {
          $gte: startDate.utc().toDate(),
          $lte: endDate.utc().toDate(),
        },
        idMyUser: idMyUser,
      };
      const basePipeline = [
        { $match: matchFilter },
        {
          $project: {
            month: {
              $dateToString: {
                format: "%m",
                date: "$createdAt",
                timezone: "America/Lima",
              },
            },
            price: 1,
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: "$price" },
          },
        },
      ];

      const [incomes, expenses] = await Promise.all([
        User.aggregate(basePipeline),
        Expenses.aggregate(basePipeline),
      ]);

      const processResults = (data) => {
        return months
          .map((m, index) => {
            const currentMonthNumber = index + 1;
            const monthKey = currentMonthNumber.toString().padStart(2, "0");

            if (targetYear == currentYear && currentMonthNumber > now.month())
              return null;

            const found = data.find((item) => item._id === monthKey);
            return {
              label: m,
              price: found ? found.total : 0,
            };
          })
          .filter((item) => item !== null);
      };
      const incomesResult = processResults(incomes);
      const expensesResult = processResults(expenses);
      const balanceResult = calculateBalanceStaticts(
        incomesResult,
        expensesResult
      );

      balance = balanceResult;
      incomes = incomesResult;
      expenses = expensesResult;
    }
    return res.status(200).json({
      incomes: incomes,
      expenses: expenses,
      balance: balance,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getStatistcData(req, res) {
  try {
    const idMyUser = req.user.uid;
    const now = moment.tz("America/Lima");

    const startOfMonth = now.clone().startOf("month");
    const endOfMonth = now.clone().endOf("day");

    const utcStart = startOfMonth.utc().toDate();
    const utcEnd = endOfMonth.utc().toDate();

    const result = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: utcStart,
            $lte: utcEnd,
          },
          idMyUser: idMyUser,
        },
      },
      {
        $facet: {
          total: [{ $count: "totalUsers" }],
          dailyCounts: [
            {
              $project: {
                day: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                    timezone: "America/Lima",
                  },
                },
              },
            },
            {
              $group: {
                _id: "$day",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);
    const totalUsers = result[0].total[0]?.totalUsers || 0;
    const daysPassed = now.date();
    const averagePerDay =
      daysPassed > 0 ? parseInt((totalUsers / daysPassed).toFixed(2)) : 0;
    return res.status(200).json({
      totalUsers,
      averagePerDay,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export { getStatistcData, getDataGraphic, getComparativeData };
