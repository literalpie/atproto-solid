import { Accessor, createEffect, createMemo, createSignal, onCleanup, useContext } from "solid-js";
import { ConvexContext } from "~/utilities/convex";
import { api } from "../../convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import { setStatus as serverSetStatus } from "~/server/setStatus";
import { type AtprotoDid } from "@atproto/oauth-client-node";

export const createStatusStore = (session: Accessor<{ did: AtprotoDid } | null | undefined>) => {
  const convex = useContext(ConvexContext);
  const [accountStatus, setAccountStatus] =
    createSignal<FunctionReturnType<typeof api.status.getAccountStatus>>();

  const [pendingStatus, setPendingStatus] = createSignal<string>();
  const [pendingSince, setPendingSince] = createSignal<Date>();

  createMemo(() => {
    const did = session()?.did;
    if (!did) return;
    const unsub = convex?.onUpdate(api.status.getAccountStatus, { did }, (value) => {
      setAccountStatus(value);
      setPendingStatus(undefined);
    });
    onCleanup(() => unsub?.());
  });

  const status = createMemo(() => {
    return pendingStatus() ?? accountStatus()?.status;
  });

  const setTheStatus = (status: string) => {
    setPendingStatus(status);
    setPendingSince(new Date());
    serverSetStatus(status)
      // status changes get handled by convex, not returned here
      .then()
      .catch(() => {
        setPendingSince(undefined);
        setPendingStatus(undefined);
      });
  };

  // If an optimistic status is pending longer than 5 seconds, reset it.
  createEffect(() => {
    if (pendingSince() === undefined) return;
    const timeout = setTimeout(() => {
      setPendingStatus(undefined);
      setPendingSince(undefined);
    }, 5_000);
    onCleanup(() => clearTimeout(timeout));
  });

  const isPending = createMemo(() => pendingStatus() !== undefined);

  return { status, setStatus: setTheStatus, isPending };
};
