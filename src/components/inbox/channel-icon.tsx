import { MessageCircle, Mail, Instagram, Facebook, Globe, Send, Phone } from "lucide-react";

export function channelLabel(channel: string): string {
  return (
    {
      whatsapp_cloud: "WhatsApp",
      whatsapp_unofficial: "WhatsApp (nao oficial)",
      instagram_dm: "Instagram DM",
      messenger: "Messenger",
      email: "Email",
      sms: "SMS",
      live_chat: "Chat no site",
      telegram: "Telegram",
    } as Record<string, string>
  )[channel] ?? channel;
}

export function channelTone(channel: string): string {
  return (
    {
      whatsapp_cloud: "bg-[#25D366]/15 text-[#25D366]",
      whatsapp_unofficial: "bg-[#128C7E]/15 text-[#128C7E]",
      instagram_dm: "bg-[#E1306C]/15 text-[#E1306C]",
      messenger: "bg-[#0084FF]/15 text-[#0084FF]",
      email: "bg-[color:var(--ink-3)]/15 text-[color:var(--ink-2)]",
      sms: "bg-[color:var(--warn)]/15 text-[color:var(--warn)]",
      live_chat: "bg-[color:var(--accent)]/15 text-[color:var(--accent)]",
      telegram: "bg-[#229ED9]/15 text-[#229ED9]",
    } as Record<string, string>
  )[channel] ?? "bg-[color:var(--bg-2)] text-[color:var(--ink-3)]";
}

export function ChannelIcon({ channel, className }: { channel: string; className?: string }) {
  const map: Record<string, typeof MessageCircle> = {
    whatsapp_cloud: MessageCircle,
    whatsapp_unofficial: MessageCircle,
    instagram_dm: Instagram,
    messenger: Facebook,
    email: Mail,
    sms: Phone,
    live_chat: Globe,
    telegram: Send,
  };
  const Icon = map[channel] ?? MessageCircle;
  return <Icon className={className ?? "h-4 w-4"} />;
}
