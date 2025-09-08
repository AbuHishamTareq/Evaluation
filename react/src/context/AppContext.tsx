import type { AppContextType } from "../types/types";
import { createContext } from "react";

export const AppContext = createContext<AppContextType | undefined>(undefined);