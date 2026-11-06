import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireOwner: vi.fn() }));
vi.mock("../service", () => ({
  createStaffAccount: vi.fn(),
  updateStaffAccount: vi.fn(),
  resetStaffPassword: vi.fn(),
  changeStaffActive: vi.fn(),
}));

import { requireOwner } from "@/lib/auth";
import { createStaff, resetPassword, setStaffActive, updateStaff } from "../actions";
import * as service from "../service";

function form(values: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(values)) f.set(k, v);
  return f;
}

beforeEach(() => vi.clearAllMocks());

describe("kiểm tra quyền", () => {
  it("người không phải chủ quán bị chặn, service không được gọi", async () => {
    vi.mocked(requireOwner).mockRejectedValue(new Error("NEXT_REDIRECT"));
    const actions = [
      () => createStaff(undefined, form({ username: "abc", fullName: "A", password: "mk1234", defaultRate: "" })),
      () => updateStaff(undefined, form({ id: "2", fullName: "A", defaultRate: "" })),
      () => resetPassword(undefined, form({ id: "2", newPassword: "mk1234" })),
      () => setStaffActive(undefined, form({ id: "2", isActive: "false" })),
    ];
    for (const run of actions) await expect(run()).rejects.toThrow("NEXT_REDIRECT");
    expect(service.createStaffAccount).not.toHaveBeenCalled();
    expect(service.updateStaffAccount).not.toHaveBeenCalled();
    expect(service.resetStaffPassword).not.toHaveBeenCalled();
    expect(service.changeStaffActive).not.toHaveBeenCalled();
  });
});

describe("validate", () => {
  beforeEach(() => vi.mocked(requireOwner).mockResolvedValue({} as never));

  it("lương mặc định sai trả RATE_001", async () => {
    const r = await createStaff(undefined, form({ username: "abc", fullName: "A", password: "mk1234", defaultRate: "-1" }));
    expect(r.success === false && r.error.code).toBe("RATE_001");
    expect(service.createStaffAccount).not.toHaveBeenCalled();
  });
  it("tên đăng nhập sai trả COMMON_001", async () => {
    const r = await createStaff(undefined, form({ username: "a b", fullName: "A", password: "mk1234", defaultRate: "" }));
    expect(r.success === false && r.error.code).toBe("COMMON_001");
  });
});
