import { LoginForm } from "./login-form";

type LoginPageProps = {
	searchParams?: Promise<{
		redirectTo?: string | string[];
	}>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const resolvedSearchParams = await searchParams;
	const redirectTo =
		Array.isArray(resolvedSearchParams?.redirectTo) ?
			resolvedSearchParams?.redirectTo[0]
		:	resolvedSearchParams?.redirectTo;

	return <LoginForm redirectTo={redirectTo ?? "/"} />;
}
