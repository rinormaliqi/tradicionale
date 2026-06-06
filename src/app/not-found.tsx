import { ErrorScreen } from "@/components/ErrorScreen";

export default function NotFound() {
  return <ErrorScreen code="404" titleKey="nf_title" textKey="nf_text" />;
}
