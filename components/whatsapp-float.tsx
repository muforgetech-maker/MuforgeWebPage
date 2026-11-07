const message =
  "Hi MuForge team! 👋 I’m interested in your services. Could you please share more details about your services and pricing?";

export function WhatsAppFloat() {
  const href = `https://wa.me/919790261693?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with MuForge on WhatsApp"
      title="Chat with MuForge on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex size-12 items-center justify-center rounded-full bg-steel text-bg shadow-1 transition-transform duration-200 hover:-translate-y-0.5 sm:bottom-7 sm:right-7 sm:size-14"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="size-7 sm:size-8"
      >
        <path
          d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L3 20l1.2-4.9a8.2 8.2 0 1 1 16-3.4Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M8.2 7.8c-.2.3-.6.8-.6 1.5s.5 1.6.6 1.8c.1.2 1.1 1.8 2.7 2.5 1.3.6 1.6.5 1.9.5.3 0 1-.4 1.2-.8.2-.4.2-.8.1-.9-.1-.1-.3-.2-.6-.3l-1.3-.6c-.2-.1-.4-.1-.5.1l-.6.7c-.1.2-.3.2-.5.1a5.8 5.8 0 0 1-1.6-1 6.3 6.3 0 0 1-1.1-1.4c-.1-.2 0-.3.1-.4l.4-.5c.1-.1.1-.3.2-.4.1-.1 0-.3 0-.4l-.6-1.4c-.1-.4-.3-.4-.5-.4h-.4c-.2 0-.4.1-.6.3Z"
          fill="currentColor"
        />
      </svg>
    </a>
  );
}
