import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { DataTable, Column } from "@/components/ui/DataTable";

describe("Button UI Component", () => {
  it("renders correctly with text", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("handles disabled states", () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeDisabled();
  });

  it("renders loader when isLoading is true", () => {
    render(<Button isLoading>Click Me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

describe("PageHeader UI Component", () => {
  it("renders title and subtitle", () => {
    render(<PageHeader title="Overview" subtitle="Details view" />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Details view")).toBeInTheDocument();
  });
});

describe("EmptyState UI Component", () => {
  it("renders title and description", () => {
    render(<EmptyState title="No items" description="Please add some items" />);
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("Please add some items")).toBeInTheDocument();
  });
});

describe("Modal UI Component", () => {
  it("renders when isOpen is true", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Body</div>
      </Modal>
    );
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal Body")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <div>Modal Body</div>
      </Modal>
    );
    expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
  });
});

describe("DataTable UI Component", () => {
  it("renders standard table data", () => {
    const columns: Column<{ name: string }>[] = [
      { key: "name", header: "Name" },
    ];
    const data = [{ name: "Alice" }];
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
});
