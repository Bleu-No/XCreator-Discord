export interface AccountInfo {
  name: string;
  email: string;
  password: string;
}

export interface SaveAccountInfo {
  path: string;
  infos: string[];
}

export interface SettingsNavigator {
  windowDelay?: number;
  inputDelay?: number;
  writeDelay?: number;
  selectorDelay?: number;
  closingMenu?: number;
  viewNavigator?: boolean;
  emailFile: string;
  inviteDiscord?: string[];
  saveFile?: SaveAccountInfo;
  Avatar?: string;
  setBio?: string;
  proxy?: string;
  proxyFile?: string
  clearConsole?: boolean;
  autoClickCaptcha?: boolean;
  useUserAgent?: boolean;
  AntiDetection?: boolean;
  autoStart?: boolean;
  autoCloseCmd?:boolean;
}

export interface DebugParams {
  message: string;
  type: "error" | "fatal" | "info" | "warn";
}

export interface NavigatorEvent {
  connect: () => void;
  test: (property: string) => void;
}
