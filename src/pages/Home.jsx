import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  TextField,
  Typography,
  Dialog,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import KeyboardVoiceRoundedIcon from "@mui/icons-material/KeyboardVoiceRounded";
import LocalAtmRoundedIcon from "@mui/icons-material/LocalAtmRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import LocalCafeRoundedIcon from "@mui/icons-material/LocalCafeRounded";
import LocalGasStationRoundedIcon from "@mui/icons-material/LocalGasStationRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import SignalCellularAltRoundedIcon from "@mui/icons-material/SignalCellularAltRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import BatteryFullRoundedIcon from "@mui/icons-material/BatteryFullRounded";
import ParkRoundedIcon from "@mui/icons-material/ParkRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import { useNavigate } from "react-router-dom";
import { defaultSuggestions } from "../data/defaultSuggestions";
import { loadTransactions, saveTransactions } from "../services/transactionStorage";
import { parseTransactionText } from "../utils/parseTransactionText";

const currency = (amount) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDisplayTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });

const formatDisplayDate = (iso) =>
  new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatMonthLabel = (date) =>
  date.toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });

const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString();

const isYesterday = (iso) => {
  const date = new Date(iso);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

const buildSeedTransaction = (seed, overrides = {}) => {
  const date = overrides.createdAt || new Date().toISOString();
  return {
    id: `seed-${seed.id}-${overrides.id || ""}`,
    type: seed.type,
    title: seed.title,
    amount: seed.amount,
    date: formatDisplayDate(date),
    time: overrides.time || formatDisplayTime(date),
    category: seed.category,
    paymentMethod: seed.paymentMethod,
    note: "",
    rawText: seed.rawText,
    createdAt: date,
    ...overrides,
  };
};

const sampleTransactions = [
  buildSeedTransaction(defaultSuggestions[0], { id: "coffee", time: "9:21 AM" }),
  buildSeedTransaction(defaultSuggestions[1], { id: "gas", time: "8:15 AM" }),
  buildSeedTransaction(defaultSuggestions[5], {
    id: "salary",
    time: "7:45 AM",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  }),
  buildSeedTransaction(defaultSuggestions[2], {
    id: "grocery",
    time: "7:30 PM",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  }),
];

const getTransactionTone = (tx) => {
  const value = `${tx.category || ""} ${tx.title || ""}`.toLowerCase();
  if (value.includes("coffee")) {
    return { icon: LocalCafeRoundedIcon, bg: "#ede6ff", color: "#6d53f6" };
  }
  if (value.includes("gas") || value.includes("transport")) {
    return { icon: LocalGasStationRoundedIcon, bg: "#ffe8e1", color: "#ef6d3c" };
  }
  if (value.includes("salary") || tx.type === "in") {
    return { icon: AccountBalanceWalletRoundedIcon, bg: "#e4f6e9", color: "#2b9f5f" };
  }
  if (value.includes("grocery")) {
    return { icon: ShoppingCartRoundedIcon, bg: "#fff3d8", color: "#f0a31a" };
  }
  if (value.includes("bill") || value.includes("electric")) {
    return { icon: BoltRoundedIcon, bg: "#e8efff", color: "#547ded" };
  }
  if (value.includes("kfc") || value.includes("food")) {
    return { icon: RestaurantRoundedIcon, bg: "#ffe6e6", color: "#ef625d" };
  }
  return { icon: PaymentsRoundedIcon, bg: "#eef1f6", color: "#667086" };
};

const phoneShellSx = {
  width: "100%",
  maxWidth: "390px",
  minHeight: "100dvh",
  backgroundColor: "#ffffff",
  borderRadius: { xs: "0px", sm: "32px" },
  boxShadow: { xs: "none", sm: "0 22px 80px rgba(42, 52, 84, 0.12)" },
  mx: "auto",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const cardSx = {
  borderRadius: "22px",
  backgroundColor: "#ffffff",
  boxShadow: "0 8px 28px rgba(44, 53, 84, 0.08)",
  border: "1px solid rgba(235, 238, 245, 0.9)",
};

function Home() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [storageReady, setStorageReady] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [quickInput, setQuickInput] = useState("");
  const [captureInput, setCaptureInput] = useState("");
  const [captureType, setCaptureType] = useState("out");
  const [captureOpen, setCaptureOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [draftMode, setDraftMode] = useState("create");
  const [draftNeedsCompletion, setDraftNeedsCompletion] = useState(false);
  const [note, setNote] = useState("");
  const [editForm, setEditForm] = useState({
    title: "",
    amount: "",
    paymentMethod: "Cash",
    type: "out",
    note: "",
  });

  useEffect(() => {
    loadTransactions()
      .then(setTransactions)
      .catch(() => setTransactions([]))
      .finally(() => setStorageReady(true));
  }, []);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(selectedMonth.getFullYear(), index, 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        date,
        label: formatMonthLabel(date),
      };
    });
  }, [selectedMonth]);

  const displayedTransactions = useMemo(() => {
    if (!storageReady) return [];
    if (!transactions.length) return sampleTransactions;
    return transactions.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return (
        itemDate.getFullYear() === selectedMonth.getFullYear() &&
        itemDate.getMonth() === selectedMonth.getMonth()
      );
    });
  }, [storageReady, transactions, selectedMonth]);

  const totals = useMemo(() => {
    const source = displayedTransactions;
    const moneyIn = source
      .filter((item) => item.type === "in")
      .reduce((sum, item) => sum + item.amount, 0);
    const moneyOut = source
      .filter((item) => item.type === "out")
      .reduce((sum, item) => sum + item.amount, 0);
    return {
      moneyIn,
      moneyOut,
      balance: moneyIn - moneyOut,
    };
  }, [displayedTransactions]);

  const insight = useMemo(() => {
    if (!transactions.length) {
      return {
        tone: "neutral",
        text: "Add a few transactions to unlock spending insights.",
      };
    }

    const currentMonthOut = transactions
      .filter((item) => {
        const itemDate = new Date(item.createdAt);
        return (
          item.type === "out" &&
          itemDate.getFullYear() === selectedMonth.getFullYear() &&
          itemDate.getMonth() === selectedMonth.getMonth()
        );
      })
      .reduce((sum, item) => sum + item.amount, 0);

    const previousMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
    const previousMonthOut = transactions
      .filter((item) => {
        const itemDate = new Date(item.createdAt);
        return (
          item.type === "out" &&
          itemDate.getFullYear() === previousMonth.getFullYear() &&
          itemDate.getMonth() === previousMonth.getMonth()
        );
      })
      .reduce((sum, item) => sum + item.amount, 0);

    if (!previousMonthOut) {
      return {
        tone: "neutral",
        text: "No previous-month expense data yet for comparison.",
      };
    }

    if (currentMonthOut === previousMonthOut) {
      return {
        tone: "neutral",
        text: "You’re spending the same as last month.",
      };
    }

    const percent = Math.round((Math.abs(currentMonthOut - previousMonthOut) / previousMonthOut) * 100);
    const isLower = currentMonthOut < previousMonthOut;

    return {
      tone: isLower ? "positive" : "warning",
      text: `You’re spending ${percent}% ${isLower ? "less" : "more"} compared to last month.`,
    };
  }, [selectedMonth, transactions]);

  const groupedTransactions = useMemo(() => {
    const sorted = [...displayedTransactions].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    const groups = { Today: [], Yesterday: [], Earlier: [] };

    sorted.forEach((item) => {
      if (isToday(item.createdAt)) groups.Today.push(item);
      else if (isYesterday(item.createdAt)) groups.Yesterday.push(item);
      else groups.Earlier.push(item);
    });

    return groups;
  }, [displayedTransactions]);

  const savedTitles = useMemo(() => {
    const seen = new Set();
    return transactions
      .map((item) => item.title)
      .filter((title) => {
        const key = title.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [transactions]);

  const titleOptions = useMemo(() => {
    const seen = new Set();
    return [...defaultSuggestions.map((item) => item.title), ...transactions.map((item) => item.title)].filter(
      (value) => {
        const key = (value || "").trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      },
    );
  }, [transactions]);

  const paymentMethodOptions = useMemo(() => {
    const seen = new Set();
    return [
      ...defaultSuggestions.map((item) => item.paymentMethod),
      ...transactions.map((item) => item.paymentMethod),
      "Cash",
      "GCash",
      "Maya",
      "Bank",
      "Bank Transfer",
      "Card",
    ].filter((value) => {
      const key = (value || "").trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [transactions]);

  const typeOptions = ["out", "in"];

  const activeInput = captureOpen ? captureInput : quickInput;

  const suggestionList = useMemo(() => {
    const query = activeInput.trim().toLowerCase();
    const fromDefault = defaultSuggestions.filter(
      (item) =>
        item.type === (captureOpen ? captureType : "out") &&
        (!query ||
          item.title.toLowerCase().includes(query) ||
          item.rawText.toLowerCase().includes(query)),
    );
    const fromHistory = savedTitles
      .filter((title) => title.toLowerCase().includes(query))
      .map((title) => ({
        id: `saved-${title}`,
        title,
        amount: 0,
        paymentMethod: "Cash",
        type: "out",
        category: "Others",
        rawText: title,
      }));
    return [...fromDefault, ...fromHistory].slice(0, query ? 6 : 3);
  }, [activeInput, captureOpen, captureType, savedTitles]);

  const recentCaptureItems = useMemo(
    () => displayedTransactions.slice(0, 3),
    [displayedTransactions],
  );

  const openCapture = () => {
    setCaptureInput(quickInput);
    setCaptureType("out");
    setCaptureOpen(true);
  };

  const closeCapture = () => {
    setCaptureOpen(false);
    setCaptureInput("");
    setCaptureType("out");
  };

  const openDraftFromText = (text, forcedType) => {
    const parsed = parseTransactionText(text);
    if (!parsed || !parsed.amount) return;
    const resolvedType = forcedType || parsed.type;
    const nextDraft = {
      ...parsed,
      type: resolvedType,
      category: resolvedType === "in" ? "Income" : parsed.category,
    };
    setDraft(nextDraft);
    setDraftMode("create");
    setDraftNeedsCompletion(false);
    setNote("");
    setEditForm({
      title: nextDraft.title,
      amount: String(nextDraft.amount),
      paymentMethod: nextDraft.paymentMethod,
      type: nextDraft.type,
      note: "",
    });
    setQuickInput(text);
    setCaptureOpen(false);
    setCaptureType("out");
  };

  const openDraftFromSuggestion = (item, forcedType) => {
    const now = new Date();
    const resolvedType = forcedType || item.type || "out";
    const nextDraft = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: resolvedType,
      title: item.title,
      amount: item.amount || 0,
      date: formatDisplayDate(now.toISOString()),
      time: formatDisplayTime(now.toISOString()),
      category: resolvedType === "in" ? "Income" : item.category || "Others",
      paymentMethod: item.paymentMethod || "Cash",
      note: "",
      rawText: item.rawText || item.title,
      createdAt: now.toISOString(),
    };

    setDraft(nextDraft);
    setDraftMode("create");
    setDraftNeedsCompletion(true);
    setNote("");
    setEditForm({
      title: nextDraft.title,
      amount: nextDraft.amount ? String(nextDraft.amount) : "",
      paymentMethod: nextDraft.paymentMethod,
      type: nextDraft.type,
      note: "",
    });
    setQuickInput(nextDraft.rawText);
    setCaptureOpen(false);
    setCaptureType("out");
  };

  const handleSuggestionClick = (item) => {
    const text = item.rawText || `${item.title} ${item.amount || ""}`.trim();
    if (captureOpen) {
      setCaptureInput(text);
      if (!item.amount) {
        openDraftFromSuggestion(item, captureType);
        return;
      }
    } else {
      setQuickInput(text);
      if (!item.amount) {
        openDraftFromSuggestion(item, item.type);
        return;
      }
    }
    openDraftFromText(text, captureOpen ? captureType : undefined);
  };

  const handleRecentCaptureClick = (item) => {
    const text = `${item.title} ${item.amount} ${item.paymentMethod}`.trim();
    openDraftFromText(text, captureType);
  };

  const handleQuickSubmit = () => openDraftFromText(quickInput);

  const handleCaptureSubmit = () => openDraftFromText(captureInput, captureType);

  const openTransactionDetails = (item) => {
    setDraft(item);
    setDraftMode("edit");
    setDraftNeedsCompletion(false);
    setNote(item.note || "");
    setEditForm({
      title: item.title || "",
      amount: String(item.amount || ""),
      paymentMethod: item.paymentMethod || "Cash",
      type: item.type || "out",
      note: item.note || "",
    });
  };

  const handleConfirmSave = async () => {
    if (!draft) return;
    const baseTransactions = transactions.length ? transactions : sampleTransactions;
    const trimmedTitle = editForm.title.trim() || draft.title;
    const parsedAmount = Number(editForm.amount) || draft.amount || 0;
    const finalTransaction = {
      ...draft,
      title: trimmedTitle,
      amount: parsedAmount,
      paymentMethod: editForm.paymentMethod || draft.paymentMethod,
      type: editForm.type || draft.type,
      note: (editForm.note || note).trim(),
      category: draft.category || parseTransactionText(trimmedTitle)?.category || "Others",
    };

    let next;
    if (draftMode === "edit") {
      next = baseTransactions.map((item) => (item.id === draft.id ? finalTransaction : item));
    } else {
      next = [finalTransaction, ...baseTransactions];
    }

    setTransactions(next);
    await saveTransactions(next);
    setDraft(null);
    setDraftMode("create");
    setDraftNeedsCompletion(false);
    setQuickInput("");
    setCaptureInput("");
    setNote("");
    setEditForm({
      title: "",
      amount: "",
      paymentMethod: "Cash",
      type: "out",
      note: "",
    });
  };

  const draftRequiresForm = draftMode === "edit" || draftNeedsCompletion;
  const saveDisabled = !editForm.title.trim() || !Number(editForm.amount);

  const handleExportTransactions = () => {
    const payload = JSON.stringify(transactions, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `money-tracker-transactions-${selectedMonth.getFullYear()}-${String(
      selectedMonth.getMonth() + 1,
    ).padStart(2, "0")}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const renderTransactionRow = (tx) => {
    const tone = getTransactionTone(tx);
    const Icon = tone.icon;
    const isExpense = tx.type === "out";

    return (
      <Stack
        key={tx.id}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onClick={() => openTransactionDetails(tx)}
        sx={{ py: "11px", cursor: "pointer" }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: tone.bg,
              color: tone.color,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ fontSize: "15px", lineHeight: 1.1, fontWeight: 700, color: "#161d2d" }}
              noWrap
            >
              {tx.title}
            </Typography>
            <Typography sx={{ mt: "4px", fontSize: "13px", lineHeight: 1.2, color: "#747b8c" }}>
              {tx.paymentMethod}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ textAlign: "right", pl: 1.5 }}>
          <Typography
            sx={{
              fontSize: "15px",
              lineHeight: 1.1,
              fontWeight: 700,
              color: isExpense ? "#d54845" : "#28a15d",
              whiteSpace: "nowrap",
            }}
          >
            {isExpense ? "-" : "+"} {currency(tx.amount)}
          </Typography>
          <Typography sx={{ mt: "6px", fontSize: "13px", lineHeight: 1.1, color: "#7d8393" }}>
            {tx.time}
          </Typography>
        </Box>
      </Stack>
    );
  };

  return (
    <Box sx={phoneShellSx}>
      <Box
        sx={{
          px: "22px",
          pt: "18px",
          pb: "18px",
          flexShrink: 0,
        }}
      >
        {activePage === "home" ? (
          <Stack spacing={0}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: "12px", pb: "18px" }}
            >
              <Typography
                sx={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#111827",
                  letterSpacing: "0.2px",
                }}
              >
                9:41
              </Typography>
              <Stack direction="row" spacing={0.4} alignItems="center" sx={{ color: "#111827" }}>
                <SignalCellularAltRoundedIcon sx={{ fontSize: 18 }} />
                <WifiRoundedIcon sx={{ fontSize: 18 }} />
                <BatteryFullRoundedIcon sx={{ fontSize: 20 }} />
              </Stack>
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ pb: "24px" }}
            >
              <Button
                onClick={() => setMonthPickerOpen(true)}
                endIcon={<ArrowDropDownRoundedIcon />}
                sx={{
                  minWidth: 0,
                  px: 0,
                  color: "#161d2d",
                  fontSize: "20px",
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { backgroundColor: "transparent" },
                }}
              >
                {formatMonthLabel(selectedMonth)}
              </Button>
              <IconButton
                onClick={() => setMonthPickerOpen(true)}
                sx={{ color: "#222938", p: 0.5 }}
              >
                <CalendarMonthRoundedIcon sx={{ fontSize: 31 }} />
              </IconButton>
            </Stack>

            <Card sx={cardSx}>
              <CardContent sx={{ p: 0 }}>
                <Box
                  sx={{
                    px: "20px",
                    pt: "22px",
                    pb: "20px",
                    background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontSize: "15px", color: "#6f7687", mb: "12px" }}>
                        Overall balance
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "34px",
                          lineHeight: 1,
                          fontWeight: 700,
                          color: "#121a32",
                        }}
                      >
                        {currency(totals.balance)}
                      </Typography>
                      <Chip
                        icon={
                          <ShowChartRoundedIcon
                            sx={{ fontSize: 15, color: "#2ea15e !important" }}
                          />
                        }
                        label="12% vs Apr"
                        sx={{
                          mt: "18px",
                          height: "36px",
                          borderRadius: "18px",
                          backgroundColor: "#e9f8ed",
                          color: "#2b9f5f",
                          "& .MuiChip-label": { px: "10px", fontSize: "13px", fontWeight: 700 },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        position: "relative",
                        width: "108px",
                        height: "108px",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: "10px",
                          width: "72px",
                          height: "12px",
                          borderRadius: "999px",
                          backgroundColor: "rgba(180, 188, 204, 0.18)",
                          filter: "blur(2px)",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: "22px",
                          width: "50px",
                          height: "50px",
                          borderRadius: "0 0 18px 18px / 0 0 20px 20px",
                          background: "linear-gradient(180deg, #ffffff 0%, #f1f2f5 100%)",
                          boxShadow: "0 10px 18px rgba(90, 103, 140, 0.12)",
                        }}
                      />
                      <ParkRoundedIcon
                        sx={{ fontSize: 68, color: "#55c46f", transform: "translateY(-8px)" }}
                      />
                    </Box>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    borderTop: "1px solid rgba(236, 239, 246, 0.95)",
                    px: "20px",
                    py: "18px",
                  }}
                >
                  <Stack direction="row" alignItems="center">
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: "15px", color: "#72798a", mb: "6px" }}>
                        Money in
                      </Typography>
                      <Typography sx={{ fontSize: "19px", fontWeight: 700, color: "#1d9f56" }}>
                        {currency(totals.moneyIn)}
                      </Typography>
                    </Box>
                    <Box sx={{ width: "1px", height: "48px", backgroundColor: "#edf0f6" }} />
                    <Box sx={{ flex: 1, pl: "22px" }}>
                      <Typography sx={{ fontSize: "15px", color: "#72798a", mb: "6px" }}>
                        Money out
                      </Typography>
                      <Typography sx={{ fontSize: "19px", fontWeight: 700, color: "#d54845" }}>
                        {currency(totals.moneyOut)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton
                  onClick={() => setActivePage("home")}
                  sx={{ color: "#222938", ml: -1 }}
                >
                  <ArrowBackRoundedIcon />
                </IconButton>
                <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#151c2d" }}>
                  All transactions
                </Typography>
              </Stack>
              <Button
                onClick={handleExportTransactions}
                sx={{
                  minWidth: 0,
                  px: 0,
                  color: "#6a53f6",
                  fontSize: "14px",
                  fontWeight: 700,
                  textTransform: "none",
                }}
              >
                Export JSON
              </Button>
            </Stack>
            <Typography sx={{ fontSize: "14px", color: "#7b8191" }}>
              Download your saved `localForage` transactions for migration later.
            </Typography>
          </Stack>
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          px: "22px",
          pb: "120px",
        }}
      >
        {activePage === "home" ? (
          <>
            <Typography
              sx={{ mt: "4px", mb: "14px", fontSize: "16px", fontWeight: 700, color: "#151c2d" }}
            >
              Insights
            </Typography>

            <Card
              sx={{
                ...cardSx,
                backgroundColor:
                  insight.tone === "warning" ? "#fff7ee" : insight.tone === "neutral" ? "#f7f8fb" : "#f1fbf3",
                border:
                  insight.tone === "warning"
                    ? "1px solid rgba(248, 228, 203, 0.95)"
                    : insight.tone === "neutral"
                      ? "1px solid rgba(231, 235, 244, 0.95)"
                      : "1px solid rgba(229, 244, 231, 0.9)",
                boxShadow: "none",
              }}
            >
              <CardContent sx={{ px: "20px", py: "18px !important" }}>
                <Stack direction="row" alignItems="center" spacing={1.75}>
                  <Box
                    sx={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      backgroundColor:
                        insight.tone === "warning"
                          ? "#f0b166"
                          : insight.tone === "neutral"
                            ? "#c9d1df"
                            : "#67cf72",
                      color: "#ffffff",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <ShowChartRoundedIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Typography
                    sx={{
                      flex: 1,
                      fontSize: "15px",
                      lineHeight: 1.35,
                      fontWeight: 600,
                      color: "#20283a",
                    }}
                  >
                    {insight.text}
                  </Typography>
                  <ChevronRightRoundedIcon
                    sx={{
                      fontSize: 24,
                      color:
                        insight.tone === "warning"
                          ? "#c4904f"
                          : insight.tone === "neutral"
                            ? "#97a1b4"
                            : "#7da88a",
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mt: "30px", mb: "10px" }}
            >
              <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#151c2d" }}>
                Recent transactions
              </Typography>
              <Button
                onClick={() => setActivePage("all")}
                sx={{
                  minWidth: 0,
                  px: 0,
                  color: "#6a53f6",
                  fontSize: "15px",
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { backgroundColor: "transparent" },
                }}
              >
                See all
              </Button>
            </Stack>

            {["Today", "Yesterday", "Earlier"].map((group) => (
              <Box key={group} sx={{ mb: group === "Earlier" ? 0 : "8px" }}>
                {groupedTransactions[group].length > 0 && (
                  <Typography sx={{ fontSize: "14px", color: "#7c8292", mb: "4px" }}>
                    {group}
                  </Typography>
                )}
                <Stack spacing={0}>{groupedTransactions[group].map(renderTransactionRow)}</Stack>
              </Box>
            ))}

            <Button
              variant="outlined"
              fullWidth
              startIcon={<MapRoundedIcon />}
              onClick={() => navigate("/routemap")}
              sx={{
                mt: 4,
                mb: 2,
                borderRadius: "16px",
                height: "52px",
                textTransform: "none",
                fontWeight: 700,
                borderColor: "#6a53f6",
                color: "#6a53f6",
                "&:hover": {
                  borderColor: "#5a45ee",
                  backgroundColor: "rgba(106, 83, 246, 0.04)",
                },
              }}
            >
              View Route Map
            </Button>
          </>
        ) : (
          <Stack spacing={0.5}>
            {displayedTransactions.length > 0 ? (
              displayedTransactions.map((item) => renderTransactionRow(item))
            ) : (
              <Typography sx={{ fontSize: "14px", color: "#7b8191", pt: 1 }}>
                No transactions in this month yet.
              </Typography>
            )}
          </Stack>
        )}
      </Box>

      {activePage === "home" ? (
        <Box
          sx={{
            position: "absolute",
            left: "22px",
            right: "22px",
            bottom: "22px",
          }}
        >
          <Box
            onClick={openCapture}
            sx={{
              height: "58px",
              borderRadius: "29px",
              border: "1px solid #e3e7f0",
              backgroundColor: "#ffffff",
              boxShadow: "0 10px 24px rgba(34, 44, 76, 0.06)",
              display: "flex",
              alignItems: "center",
              px: "8px",
              cursor: "text",
            }}
          >
            <IconButton
              onClick={openCapture}
              sx={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                backgroundColor: "#6a53f6",
                color: "#ffffff",
                "&:hover": { backgroundColor: "#624cf0" },
              }}
            >
              <AddRoundedIcon />
            </IconButton>
            <TextField
              fullWidth
              value={quickInput}
              onChange={(event) => setQuickInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleQuickSubmit();
              }}
              placeholder="What did you spend?"
              variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: {
                  px: "14px",
                  fontSize: "16px",
                  color: "#1c2231",
                  "& input::placeholder": {
                    color: "#8c92a3",
                    opacity: 1,
                  },
                },
              }}
            />
            <IconButton sx={{ color: "#5d6475" }}>
              <KeyboardVoiceRoundedIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              width: "134px",
              height: "5px",
              borderRadius: "999px",
              backgroundColor: "#0b0d12",
              mx: "auto",
              mt: "14px",
            }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            width: "134px",
            height: "5px",
            borderRadius: "999px",
            backgroundColor: "#0b0d12",
            mx: "auto",
            mb: "14px",
            flexShrink: 0,
          }}
        />
      )}

      <Dialog
        open={monthPickerOpen}
        onClose={() => setMonthPickerOpen(false)}
        fullWidth
        PaperProps={{
          sx: {
            maxWidth: "min(390px, 90vw)",
            width: "calc(100vw - 32px)",
            mx: "auto",
            my: 2,
            borderRadius: "24px",
          },
        }}
      >
        <Box sx={{ px: "18px", py: "18px" }}>
          <Stack spacing={1.25}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#151c2d" }}>
                Select month
              </Typography>
              <IconButton onClick={() => setMonthPickerOpen(false)} sx={{ color: "#7d8393" }}>
                <CloseRoundedIcon />
              </IconButton>
            </Stack>

            <Stack spacing={0.5}>
              {monthOptions.map((option) => {
                const isSelected =
                  option.date.getMonth() === selectedMonth.getMonth() &&
                  option.date.getFullYear() === selectedMonth.getFullYear();

                return (
                  <Button
                    key={option.key}
                    onClick={() => {
                      setSelectedMonth(option.date);
                      setMonthPickerOpen(false);
                    }}
                    sx={{
                      justifyContent: "space-between",
                      px: "14px",
                      py: "12px",
                      borderRadius: "16px",
                      textTransform: "none",
                      color: "#1d2433",
                      backgroundColor: isSelected ? "#f1efff" : "transparent",
                    }}
                  >
                    <span>{option.label}</span>
                    {isSelected ? (
                      <CheckRoundedIcon sx={{ fontSize: 18, color: "#6a53f6" }} />
                    ) : null}
                  </Button>
                );
              })}
            </Stack>
          </Stack>
        </Box>
      </Dialog>

      <Dialog
        open={captureOpen}
        onClose={closeCapture}
        fullScreen
        PaperProps={{
          sx: {
            maxWidth: "min(390px, 90vw)",
            mx: "auto",
            width: "calc(100vw - 32px)",
            backgroundColor: "#ffffff",
            my: 2,
            borderRadius: "24px",
          },
        }}
      >
        <Box sx={{ minHeight: "100%", px: "22px", pt: "16px", pb: "26px" }}>
          <Stack spacing={2.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ width: "40px" }} />
              <Box
                sx={{
                  width: "46px",
                  height: "5px",
                  borderRadius: "999px",
                  backgroundColor: "#d2d6e0",
                }}
              />
              <IconButton onClick={closeCapture} sx={{ color: "#7d8393" }}>
                <CloseRoundedIcon />
              </IconButton>
            </Stack>

            <Box>
              <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#151c2d", mb: "4px" }}>
                {captureType === "in" ? "What money came in?" : "What did you spend?"}
              </Typography>
              <Typography sx={{ fontSize: "16px", color: "#757c8d" }}>
                Type naturally, we&apos;ll take care of the rest.
              </Typography>
            </Box>

            <Box
              sx={{
                p: "4px",
                borderRadius: "18px",
                backgroundColor: "#f4f6fb",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px",
              }}
            >
              <Button
                onClick={() => setCaptureType("out")}
                sx={{
                  height: "42px",
                  borderRadius: "14px",
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: captureType === "out" ? "#ffffff" : "#646d80",
                  backgroundColor: captureType === "out" ? "#6a53f6" : "transparent",
                  "&:hover": {
                    backgroundColor: captureType === "out" ? "#624cf0" : "#ebedf5",
                  },
                }}
              >
                Spends
              </Button>
              <Button
                onClick={() => setCaptureType("in")}
                sx={{
                  height: "42px",
                  borderRadius: "14px",
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: captureType === "in" ? "#ffffff" : "#646d80",
                  backgroundColor: captureType === "in" ? "#2b9f5f" : "transparent",
                  "&:hover": {
                    backgroundColor: captureType === "in" ? "#28955a" : "#ebedf5",
                  },
                }}
              >
                In
              </Button>
            </Box>

            <TextField
              fullWidth
              autoFocus
              value={captureInput}
              onChange={(event) => setCaptureInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleCaptureSubmit();
              }}
              placeholder={captureType === "in" ? "salary 20k" : "coffee 120"}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "72px",
                  borderRadius: "20px",
                  pr: "10px",
                  backgroundColor: "#ffffff",
                  "& fieldset": { borderColor: "#7b67fb", borderWidth: "1.5px" },
                  "&.Mui-focused fieldset": { borderColor: "#6a53f6", borderWidth: "1.5px" },
                },
                "& .MuiOutlinedInput-input": {
                  fontSize: "18px",
                  px: "18px",
                },
              }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={handleCaptureSubmit}
                    sx={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      backgroundColor: "#6a53f6",
                      color: "#ffffff",
                      "&:hover": { backgroundColor: "#624cf0" },
                    }}
                  >
                    <ArrowForwardRoundedIcon />
                  </IconButton>
                ),
              }}
            />

            <Box>
              <Typography sx={{ mb: "12px", fontSize: "16px", color: "#5f6678", fontWeight: 600 }}>
                Suggestions
              </Typography>
              <Stack direction="row" spacing={1.25} sx={{ overflowX: "auto" }}>
                {suggestionList.map((item) => {
                  const tone = getTransactionTone(item);
                  const Icon = tone.icon;
                  return (
                    <Card
                      key={item.id}
                      onClick={() => handleSuggestionClick(item)}
                      sx={{
                        minWidth: "118px",
                        borderRadius: "18px",
                        border: "1px solid rgba(236, 239, 246, 1)",
                        boxShadow: "none",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <CardContent sx={{ p: "12px !important" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "50%",
                              backgroundColor: tone.bg,
                              color: tone.color,
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Icon sx={{ fontSize: 20 }} />
                          </Box>
                          <Box>
                            <Typography
                              sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#151c2d",
                                lineHeight: 1.1,
                              }}
                            >
                              {item.title}
                            </Typography>
                            <Typography sx={{ mt: "4px", fontSize: "13px", color: "#5f6678" }}>
                              {item.amount ? currency(item.amount) : "Tap to add amount"}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </Box>

            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: "12px" }}
              >
                <Typography sx={{ fontSize: "16px", color: "#5f6678", fontWeight: 600 }}>
                  Recent
                </Typography>
                <ChevronRightRoundedIcon sx={{ color: "#9aa1b2" }} />
              </Stack>

              <Card sx={{ ...cardSx, borderRadius: "24px", boxShadow: "none" }}>
                <CardContent sx={{ p: "12px 14px !important" }}>
                  <Stack spacing={0.5}>
                    {recentCaptureItems.map((item) => {
                      const tone = getTransactionTone(item);
                      const Icon = tone.icon;
                      return (
                        <Stack
                          key={item.id}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          onClick={() => handleRecentCaptureClick(item)}
                          sx={{ py: "9px", cursor: "pointer" }}
                        >
                          <Stack direction="row" spacing={1.1} alignItems="center">
                            <Box
                              sx={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "50%",
                                backgroundColor: tone.bg,
                                color: tone.color,
                                display: "grid",
                                placeItems: "center",
                              }}
                            >
                              <Icon sx={{ fontSize: 18 }} />
                            </Box>
                            <Typography
                              sx={{ fontSize: "16px", color: "#151c2d", fontWeight: 600 }}
                            >
                              {item.title}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Typography sx={{ fontSize: "15px", color: "#222938" }}>
                              {currency(item.amount)}
                            </Typography>
                            <Typography sx={{ fontSize: "15px", color: "#7b8191" }}>
                              {item.paymentMethod}
                            </Typography>
                          </Stack>
                        </Stack>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        fullWidth
        PaperProps={{
          sx: {
            m: 0,
            mt: "auto",
            maxWidth: "min(390px, 90vw)",
            width: "calc(100vw - 32px)",
            mx: "auto",
            borderTopLeftRadius: "28px",
            borderTopRightRadius: "28px",
            borderBottomLeftRadius: "20px",
            borderBottomRightRadius: "20px",
            px: "8px",
            pb: "12px",
            mb: 2,
          },
        }}
      >
        <Box sx={{ px: "14px", pt: "14px" }}>
          <Box
            sx={{
              width: "46px",
              height: "5px",
              borderRadius: "999px",
              backgroundColor: "#d2d6e0",
              mx: "auto",
            }}
          />

          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: "18px", mb: "14px" }}>
            <Box
              sx={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                backgroundColor: "#61cb70",
                color: "#ffffff",
                display: "grid",
                placeItems: "center",
              }}
            >
              <CheckRoundedIcon />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#151c2d" }}>
                {draftMode === "edit" ? "Transaction details" : draftRequiresForm ? "Complete details" : "Got it!"}
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "#7b8191" }}>
                {draftMode === "edit"
                  ? "Review or update this entry"
                  : draftRequiresForm
                    ? "Add the missing details before saving"
                    : "Please confirm the details"}
              </Typography>
            </Box>
          </Stack>

          {draft && (
            <Card sx={{ ...cardSx, borderRadius: "18px", boxShadow: "none", mb: "14px" }}>
              <CardContent sx={{ p: "14px !important" }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Box
                    sx={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "50%",
                      backgroundColor: getTransactionTone(draft).bg,
                      color: getTransactionTone(draft).color,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {React.createElement(getTransactionTone(draft).icon, { sx: { fontSize: 24 } })}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#151c2d" }}>
                        {draftRequiresForm ? editForm.title || draft.title : draft.title}
                      </Typography>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#151c2d" }}>
                          {currency(Number(editForm.amount) || draft.amount)}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color:
                              (draftRequiresForm ? editForm.type : draft.type) === "out"
                                ? "#ef625d"
                                : "#2b9f5f",
                          }}
                        >
                          {(draftRequiresForm ? editForm.type : draft.type) === "out"
                            ? "Expense"
                            : "Income"}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={0.75} sx={{ mt: "10px", flexWrap: "wrap" }}>
                      <Chip
                        label={`Today, ${draft.time}`}
                        size="small"
                        sx={{
                          height: "28px",
                          borderRadius: "14px",
                          backgroundColor: "#f2f4f8",
                          color: "#60697b",
                        }}
                      />
                      <Chip
                        icon={<LocalAtmRoundedIcon sx={{ fontSize: 15 }} />}
                        label={draftRequiresForm ? editForm.paymentMethod : draft.paymentMethod}
                        size="small"
                        sx={{
                          height: "28px",
                          borderRadius: "14px",
                          backgroundColor: "#f2f4f8",
                          color: "#60697b",
                        }}
                      />
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}

          {draftMode === "create" && !draftRequiresForm && (
            <Button
              startIcon={<NotesRoundedIcon />}
              sx={{
                px: 0,
                mb: "10px",
                color: "#6a53f6",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { backgroundColor: "transparent" },
              }}
            >
              Add note (optional)
            </Button>
          )}

          {draftRequiresForm && (
            <Stack spacing={1.2} sx={{ mb: "14px" }}>
              <Autocomplete
                freeSolo
                options={titleOptions}
                value={editForm.title}
                onChange={(_, value) =>
                  setEditForm((prev) => ({ ...prev, title: typeof value === "string" ? value : value || "" }))
                }
                onInputChange={(_, value) => setEditForm((prev) => ({ ...prev, title: value }))}
                renderInput={(params) => <TextField {...params} fullWidth label="Title" />}
              />
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={editForm.amount}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, amount: event.target.value }))
                }
              />
              <Autocomplete
                freeSolo
                options={paymentMethodOptions}
                value={editForm.paymentMethod}
                onChange={(_, value) =>
                  setEditForm((prev) => ({
                    ...prev,
                    paymentMethod: typeof value === "string" ? value : value || "",
                  }))
                }
                onInputChange={(_, value) => setEditForm((prev) => ({ ...prev, paymentMethod: value }))}
                renderInput={(params) => <TextField {...params} fullWidth label="Payment method" />}
              />
              <Autocomplete
                freeSolo
                options={typeOptions}
                value={editForm.type}
                onChange={(_, value) =>
                  setEditForm((prev) => ({ ...prev, type: typeof value === "string" ? value : value || "" }))
                }
                onInputChange={(_, value) => setEditForm((prev) => ({ ...prev, type: value }))}
                renderInput={(params) => (
                  <TextField {...params} fullWidth label="Type" helperText="Use in or out" />
                )}
              />
            </Stack>
          )}

          <TextField
            fullWidth
            value={draftRequiresForm ? editForm.note : note}
            onChange={(event) => {
              if (draftRequiresForm) {
                setEditForm((prev) => ({ ...prev, note: event.target.value }));
                return;
              }
              setNote(event.target.value);
            }}
            placeholder="What was this for?"
            multiline
            minRows={2}
            sx={{
              mb: "16px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "18px",
                backgroundColor: "#fbfcff",
              },
            }}
          />

          <Button
            variant="contained"
            onClick={handleConfirmSave}
            disabled={saveDisabled}
            sx={{
              width: "100%",
              height: "52px",
              borderRadius: "16px",
              background: "linear-gradient(90deg, #6a53f6 0%, #5a45ee 100%)",
              boxShadow: "none",
              textTransform: "none",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            {draftMode === "edit" ? "Update" : draftRequiresForm ? "Save transaction" : "Save"}
          </Button>

          <Button
            onClick={() => {
              setDraft(null);
              setDraftMode("create");
              setDraftNeedsCompletion(false);
            }}
            sx={{
              width: "100%",
              mt: "8px",
              color: "#2c3343",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}

export default Home;
