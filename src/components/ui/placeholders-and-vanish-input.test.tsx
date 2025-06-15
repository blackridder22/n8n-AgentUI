import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlaceholdersAndVanishInput } from './placeholders-and-vanish-input';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>),
    p: React.forwardRef(({ children, ...props }: any, ref: any) => <p ref={ref} {...props}>{children}</p>),
    svg: React.forwardRef(({ children, ...props }: any, ref: any) => <svg ref={ref} {...props}>{children}</svg>),
    path: React.forwardRef(({ children, ...props }: any, ref: any) => <path ref={ref} {...props}>{children}</path>),
  },
}));

describe('PlaceholdersAndVanishInput', () => {
  const mockPlaceholders = ['Enter your name', 'Enter your email', 'Enter your query'];
  const mockOnChange = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnAnimationComplete = jest.fn();

  const defaultProps = {
    placeholders: mockPlaceholders,
    onChange: mockOnChange,
    onSubmit: mockOnSubmit,
    value: '',
    onAnimationComplete: mockOnAnimationComplete,
    disabled: false,
    pill: undefined,
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders the input field', () => {
    render(<PlaceholdersAndVanishInput {...defaultProps} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('displays initial placeholders and cycles through them', () => {
    render(<PlaceholdersAndVanishInput {...defaultProps} />);
    expect(screen.getByText(mockPlaceholders[0])).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText(mockPlaceholders[1])).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText(mockPlaceholders[2])).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText(mockPlaceholders[0])).toBeInTheDocument(); // Cycles back
  });

  test('calls onChange prop when input value changes', () => {
    render(<PlaceholdersAndVanishInput {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test input' } });
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    // Note: The actual value update is handled by the parent through the `value` prop.
  });

  test('calls onSubmit prop when the form is submitted', () => {
    // Mock draw and animate to prevent canvas errors in test
    const mockDraw = jest.fn();
    const mockAnimate = jest.fn();
    jest.spyOn(React, 'useCallback').mockImplementation((fn) => fn); // Simplified mock for useCallback

    // Need to provide a value for submission to trigger animation logic
    render(<PlaceholdersAndVanishInput {...defaultProps} value="test submit" />);

    const form = screen.getByRole('textbox').closest('form');
    if (form) {
      // Mocking canvas related functions if they are called during submit
      HTMLCanvasElement.prototype.getContext = () => ({
        clearRect: jest.fn(),
        fillText: jest.fn(),
        getImageData: () => ({ data: [] }),
        beginPath: jest.fn(),
        rect: jest.fn(),
        stroke: jest.fn(),
        // Add other methods if specific errors arise
      } as any);

      fireEvent.submit(form);
    }

    // Wait for animations if any (even mocked)
    act(() => {
        jest.runAllTimers(); // or jest.runAllTicks() if using requestAnimationFrame mocks
    });

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    // Check if onAnimationComplete is called if input was present
    expect(mockOnAnimationComplete).toHaveBeenCalled();
  });

  test('displays the pill when pill prop is provided', () => {
    const pillProps = { text: 'Webhook: Zapier', onClear: jest.fn() };
    render(<PlaceholdersAndVanishInput {...defaultProps} pill={pillProps} />);
    expect(screen.getByText(pillProps.text)).toBeInTheDocument();
  });

  test('clears pill on backspace when input is empty', () => {
    const mockOnClear = jest.fn();
    const pillProps = { text: 'ActivePill', onClear: mockOnClear };
    render(<PlaceholdersAndVanishInput {...defaultProps} value="" pill={pillProps} />);

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Backspace', code: 'Backspace' });

    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  test('verifies input is disabled when disabled prop is true', () => {
    render(<PlaceholdersAndVanishInput {...defaultProps} disabled={true} />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();

    // Check if submit button is also disabled
    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
  });

  test('does not show placeholder animation when value is present', () => {
    render(<PlaceholdersAndVanishInput {...defaultProps} value="Some text" />);
    // Placeholder text should not be visible
    expect(screen.queryByText(mockPlaceholders[0])).not.toBeInTheDocument();
  });

  test('does not show placeholder animation when pill is present', () => {
    const pillProps = { text: 'ActivePill', onClear: jest.fn() };
    render(<PlaceholdersAndVanishInput {...defaultProps} value="" pill={pillProps} />);
    // Placeholder text should not be visible
    expect(screen.queryByText(mockPlaceholders[0])).not.toBeInTheDocument();
  });

});
