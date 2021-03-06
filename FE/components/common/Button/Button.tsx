import classNames from "classnames";
import CircularLoading from "../../global/Loading/CircularLoading";

export type ButtonBase =
  | "primary"
  | "light-primary"
  | "light"
  | "danger"
  | "danger-outline"
  | "custom";

interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
  base?: ButtonBase;
  customBaseClassName?: string;
  loading?: boolean;
  type?: "button" | "submit" | "reset" | undefined;
}

const Button = ({
  className,
  children,
  base = "primary",
  disabled = false,
  type = "button",
  customBaseClassName,
  loading = false,
  onClick,
  ...props
}: ButtonProps) => {
  const handleClick = (e: any) => {
    if (!disabled && !loading) onClick && onClick(e);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      type={type}
      className={classNames(className, {
        "py-2 px-4 rounded-md text-sm font-be": base !== "custom",
        [`${customBaseClassName}`]: base === "custom" && !disabled,
        "bg-blue-600 text-white hover:bg-blue-700 transition-colors":
          base === "primary" && !disabled,
        "bg-lightblue text-blue-700 hover:bg-lightblue-100 transition-colors":
          base === "light-primary" && !disabled,
        "bg-gray-100 hover:bg-gray-200 transition-colors":
          base === "light" && !disabled,
        "bg-red-50 hover:bg-red-100 text-red-600 transition-colors":
          base === "danger" && !disabled,
        "border-2 border-red-300 text-red-500 hover:bg-red-50/70 transition-colors":
          base === "danger-outline" && !disabled,
        "bg-gray-200 ": disabled,
        "flex-center": loading,
        "cursor-default": disabled || loading,
      })}
      {...props}
    >
      {loading ? (
        <>
          <CircularLoading size={16} />
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
