import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Footer from "../src/app/components/footer";

describe("Footer", () => {
	it("renders a p tag inside footer", () => {
		render(<Footer />);

		const pTag = screen.getByText(
			"Your private and secure space for thoughts and ideas."
		);

		expect(pTag).toBeInTheDocument();
	});
});
