import React from "react";

export function UiInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full px-3 py-2 bg-primary-800 border border-primary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent " +
        (props.className || "")
      }
    />
  );
}

export function UiSelect({
  colorBackground,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  colorBackground?: string;
}) {
  return (
    <>
      <style>
        {`
          select,
          select::picker(select) {
            appearance: base-select;
          }
        `}
      </style>
      <select
        {...props}
        style={{
          backgroundColor: colorBackground || undefined,
          color: colorBackground ? "var(--color-text-inverse)" : undefined,
          ...props.style,
        }}
        className={
          "w-full px-3 py-2 bg-primary-800 border border-primary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent " +
          (props.className || "")
        }
      >
        {props.children}
      </select>
    </>
  );
}

export function UiButton({
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "danger" | "success" | "secondary";
}) {
  const base = "px-4 py-2 rounded-lg transition-colors ";
  const variants: Record<string, string> = {
    default: "bg-neutral-600 hover:bg-neutral-700",
    primary: "bg-primary-600 hover:bg-primary-700",
    danger: "bg-error-600 hover:bg-error-700",
    success: "bg-success-600 hover:bg-success-700",
    secondary: "bg-secondary-600 hover:bg-secondary-700",
  };
  return (
    <button
      {...props}
      className={
        base +
        variants[variant] +
        " text-text-inverse" +
        (props.className ? " " + props.className : "")
      }
    >
      {props.children}
    </button>
  );
}

export function UiCard(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={
        "border border-primary-700 bg-primary-800 rounded-lg p-4 " +
        (props.className || "")
      }
    >
      {props.children}
    </div>
  );
}

export function UiModal(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={
        "fixed inset-0 bg-background-dark bg-opacity-50 flex items-center justify-center z-50 p-4 " +
        (props.className || "")
      }
    >
      {props.children}
    </div>
  );
}

export function UiModalContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={
        "bg-primary-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto text-text-inverse " +
        (props.className || "")
      }
    >
      {props.children}
    </div>
  );
}
