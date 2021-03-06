import { yupResolver } from "@hookform/resolvers/yup";
import { GetServerSideProps, NextPage } from "next";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import Button from "../components/common/Button/Button";
import Checkbox from "../components/common/Checkbox/Checkbox";
import FloatingInput from "../components/common/Input/FloatingInput";
import Logo from "../components/global/Logo/Logo";
import LoginWithFacebookButton from "../components/pages/Auth/LoginWithFacebookButton";
import LoginWithGoogleButton from "../components/pages/Auth/LoginWithGoogleButton";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const error = context.query.error;
  if (session) {
    return { redirect: { destination: "/app", permanent: false } };
  }
  return { props: { error: error ? true : false } };
};

const loginSchema = yup.object({
  email: yup
    .string()
    .required("Please enter your email")
    .email("Invalid email address"),
  password: yup.string().required("Please enter your password"),
});

const Login: NextPage = ({ error }: any) => {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      remember: true,
      email: "",
      general: "",
      password: "",
    },
  });

  const router = useRouter();

  console.log(router.query);

  const onSubmit = async (userData: any) => {
    if (isSubmitting) {
      return;
    }
    clearErrors();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const data: any = await signIn("credentials", {
      email: userData.email,
      password: userData.password,
      redirect: false,
    });
    if (data.ok) {
      if (router.query.redirect) {
        router.push(router.query.redirect as string);
      } else {
        router.push("app");
      }
    } else {
      setError("general", { message: "Invalid email or password" });
    }
  };

  useEffect(() => {
    if (error) {
      setError("general", {
        message: "Something went wrong. Please contact technical support.",
      });
    }
  }, []);

  return (
    <div className="flex w-screen h-screen space-x-10">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-5/12 flex-shrink-0 p-20 pt-16"
      >
        <div>
          <Link href="/">
            <a className="mb-4 block">
              <Logo />
            </a>
          </Link>
          <div className="text-3xl font-black text-darkblue font-be">
            Hello,{" "}
            <span className="w-full inline-block mt-2">Welcome back</span>
          </div>
        </div>
        <div className="flex-1 mt-12 mb-6">
          {errors?.general && (
            <div className="text-red-500 mb-8 text-sm font-medium -mt-4 py-1.5 px-3 bg-red-100/80 rounded-md">
              {errors.general.message}
            </div>
          )}
          <div className="space-y-10 text-sm text-gray-600 px-1">
            <FloatingInput
              error={errors?.email?.message}
              {...register("email")}
              placeholder="Email"
            />
            <FloatingInput
              error={errors?.password?.message}
              {...register("password")}
              placeholder="Password"
              type="password"
            />
          </div>
        </div>
        <div className="flex justify-between items-center mb-5 text-[13px] font-semibold text-indigo-700">
          <Checkbox
            defaultChecked={true}
            onChange={(e: any) => setValue("remember", e.target.checked)}
            placeholder="Remember me"
            id="remember-me"
          />
          <div>
            <Link href="/forgot-password">
              <a>Forgot password?</a>
            </Link>
          </div>
        </div>
        <div>
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            base="custom"
            customBaseClassName="hover:bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 bg-gradient-to-r text-white"
            className="w-full flex-center transition-all shadow-md font-semibold text-xl py-2 rounded-md mb-6"
          >
            LOGIN
          </Button>
          <div className="text-center text-sm font-medium text-darkblue">
            Don&apos;t have an account?{" "}
            <Link href="/register">
              <a className="text-indigo-700 font-bold">Register</a>
            </Link>
          </div>
        </div>
        <div className="flex items-center my-8">
          <div className="flex-1 bg-gray-200 h-px"></div>
          <div className="text-sm font-semibold text-gray-600 mx-4">OR</div>
          <div className="flex-1 bg-gray-200 h-px"></div>
        </div>
        <div className="flex space-x-6">
          <LoginWithGoogleButton />
          <LoginWithFacebookButton />
        </div>
      </form>
      <div className="flex-1 bg-[#F7F6F9] flex-center select-none">
        <img
          alt="background"
          className="w-full"
          src="/login.png"
        />
      </div>
    </div>
  );
};

export default Login;
