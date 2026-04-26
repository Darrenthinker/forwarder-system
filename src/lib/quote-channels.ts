import rawData from "../../data/quote-channels-raw.json";

export type ChannelLabel = {
  LabelID: number;
  LabelName: string;
  IsPublic: boolean;
};

export type ChannelFee = {
  FeeName: string;
  FeeUnit: 1 | 2;
  Price: number;
};

export type RawChannel = {
  ChannelKey: string;
  ChannelName: string;
  ChannelCode?: string;
  SupplierName: string;
  ChannelTypeCode: 1 | 6 | number;
  ModeCode: string;
  Currency: 1 | 3 | number;
  StartCityName: string;
  CountryName: string;
  WorkDays: number;
  CargoTypeInfo: string;
  VolumnBase: number;
  IsTax?: boolean;
  RiskWarning?: string;
  ChannelDescription?: string;
  ChannelLabel: ChannelLabel[] | null;
  ServiceType?: string | null;
  Price: number;
  Amount: number;
  TrafficAmount: number;
  FeeInfo: ChannelFee[];
  WareFlightDesc?: string;
  FlightDesc?: string;
  BatteryNotice?: string;
};

export const RAW_CHANNELS: RawChannel[] = (rawData as { ChannelsSample: RawChannel[] })
  .ChannelsSample;

export const MODE_OPTIONS = [
  { code: "DHL", label: "DHL", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { code: "UPS", label: "UPS", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { code: "FEDEX", label: "FEDEX", color: "bg-purple-100 text-purple-700 border-purple-300" },
  { code: "ARAMEX", label: "ARAMEX", color: "bg-red-100 text-red-700 border-red-300" },
  { code: "EMS", label: "EMS", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { code: "DPD", label: "DPD", color: "bg-rose-100 text-rose-700 border-rose-300" },
  { code: "SF", label: "顺丰SF", color: "bg-slate-100 text-slate-700 border-slate-300" },
  { code: "3PE", label: "3PE", color: "bg-teal-100 text-teal-700 border-teal-300" },
] as const;

export const CARGO_TYPE_OPTIONS = [
  { id: "139", label: "普货" },
  { id: "140", label: "内置电池" },
  { id: "141", label: "配套电池" },
  { id: "142", label: "纯电池" },
  { id: "143", label: "纺织品" },
  { id: "144", label: "电子产品" },
  { id: "145", label: "化妆品" },
  { id: "146", label: "液体" },
  { id: "147", label: "粉末" },
  { id: "148", label: "木箱" },
  { id: "149", label: "手机(无电)" },
  { id: "150", label: "手机(内电)" },
  { id: "151", label: "手机(配电)" },
] as const;

export const COUNTRY_OPTIONS = [
  { key: "4ae00ac2-0673-4b13-83fc-e15c72909610", code: "US", name: "美国", nameEn: "United States" },
  { key: "uk-key", code: "GB", name: "英国", nameEn: "United Kingdom" },
  { key: "de-key", code: "DE", name: "德国", nameEn: "Germany" },
  { key: "fr-key", code: "FR", name: "法国", nameEn: "France" },
  { key: "ca-key", code: "CA", name: "加拿大", nameEn: "Canada" },
  { key: "au-key", code: "AU", name: "澳大利亚", nameEn: "Australia" },
  { key: "jp-key", code: "JP", name: "日本", nameEn: "Japan" },
] as const;

export const START_CITY_OPTIONS = [
  { key: "87928c0a-7344-4124-8abe-305115bdf476", name: "深圳市", code: "SZX" },
  { key: "gz-key", name: "广州市", code: "CAN" },
  { key: "hkg-key", name: "香港", code: "HKG" },
  { key: "sha-key", name: "上海市", code: "SHA" },
  { key: "yiv-key", name: "义乌市", code: "YIV" },
] as const;

export const PACKET_TYPE_OPTIONS = [
  { value: "1", label: "出口" },
  { value: "2", label: "进口" },
] as const;

export const QUERY_TYPE_OPTIONS = [
  { value: "1", label: "按总数量+总重量" },
  { value: "2", label: "按单件" },
] as const;

export type QuoteParams = {
  startCityKey?: string;
  countryKey?: string;
  weight: number;
  cbm: number;
  quantity: number;
  cargoTypeIds: string[];
  modeCodes: string[];
  channelName?: string;
  packetType?: string;
  customerName?: string;
};

export type QuoteResultItem = RawChannel & {
  ChargeWeight: number;
  ScaledTraffic: number;
  ScaledAmount: number;
  ScaledPrice: number;
  CostFeeTotal: number;
  PerKgFees: number;
  FixedFees: number;
};

const SAMPLE_REF_WEIGHT = 15;

export function searchChannels(params: QuoteParams): {
  total: number;
  items: QuoteResultItem[];
} {
  const w = Math.max(0.5, Number(params.weight) || 0);
  const cargoSet = new Set((params.cargoTypeIds ?? []).map((x) => x.trim()));
  const modeSet = new Set((params.modeCodes ?? []).map((x) => x.trim().toUpperCase()));

  const cargoLabelById = new Map<string, string>(CARGO_TYPE_OPTIONS.map((x) => [x.id, x.label]));

  const items: QuoteResultItem[] = [];
  for (const c of RAW_CHANNELS) {
    if (modeSet.size > 0) {
      const matched = [...modeSet].some((m) => c.ModeCode.toUpperCase().startsWith(m));
      if (!matched) continue;
    }
    if (cargoSet.size > 0) {
      const allowedLabels = c.CargoTypeInfo.split(",").map((s) => s.trim());
      const wanted = [...cargoSet].map((id) => cargoLabelById.get(id) ?? id);
      const ok = wanted.every((label) => allowedLabels.includes(label));
      if (!ok) continue;
    }
    if (params.channelName && params.channelName.trim()) {
      const kw = params.channelName.trim();
      if (!c.ChannelName.includes(kw)) continue;
    }

    const chargeWeight = Math.max(w, 0.5);
    const scaleFactor = chargeWeight / SAMPLE_REF_WEIGHT;
    const scaledTraffic = round2(c.TrafficAmount * scaleFactor);

    let perKg = 0;
    let fixed = 0;
    for (const f of c.FeeInfo ?? []) {
      if (f.FeeUnit === 2) perKg += f.Price * scaleFactor;
      else fixed += f.Price;
    }
    const costFeeTotal = round2(perKg + fixed);
    const scaledAmount = round2(scaledTraffic + costFeeTotal);
    const scaledPrice = chargeWeight > 0 ? round2(scaledAmount / chargeWeight) : 0;

    items.push({
      ...c,
      ChargeWeight: chargeWeight,
      ScaledTraffic: scaledTraffic,
      ScaledAmount: scaledAmount,
      ScaledPrice: scaledPrice,
      CostFeeTotal: costFeeTotal,
      PerKgFees: round2(perKg),
      FixedFees: round2(fixed),
    });
  }

  items.sort((a, b) => a.ScaledPrice - b.ScaledPrice);

  return { total: items.length, items };
}

export function currencyLabel(c: number): string {
  if (c === 1) return "CNY";
  if (c === 3) return "HKD";
  return "CNY";
}

export function modeFamily(modeCode: string): string {
  const upper = modeCode.toUpperCase();
  for (const m of MODE_OPTIONS) {
    if (upper.startsWith(m.code)) return m.code;
  }
  return upper.split("-")[0] ?? upper;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
