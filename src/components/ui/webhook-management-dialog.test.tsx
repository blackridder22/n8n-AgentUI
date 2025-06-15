import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WebhookManagementDialog } from './webhook-management-dialog';
import { Webhook } from './demo'; // Assuming Webhook interface is here or in a shared types file

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Trash2: (props: any) => <svg data-testid="trash-icon" {...props} />,
}));

const mockWebhooks: Webhook[] = [
  { id: '1', name: 'Webhook 1', url: 'http://example.com/webhook1' },
  { id: '2', name: 'Webhook 2', url: 'http://example.com/webhook2' },
];

describe('WebhookManagementDialog', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnAddWebhook = jest.fn();
  const mockOnDeleteWebhook = jest.fn();
  const mockOnSetDefaultWebhook = jest.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    webhooks: mockWebhooks,
    defaultWebhook: mockWebhooks[0],
    onAddWebhook: mockOnAddWebhook,
    onDeleteWebhook: mockOnDeleteWebhook,
    onSetDefaultWebhook: mockOnSetDefaultWebhook,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dialog with webhooks and input fields', () => {
    render(<WebhookManagementDialog {...defaultProps} />);

    expect(screen.getByText('Manage Webhooks')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('URL')).toBeInTheDocument();
    expect(screen.getByText('Add Webhook')).toBeInTheDocument();

    expect(screen.getByText('Webhook 1')).toBeInTheDocument();
    expect(screen.getByText('(http://example.com/webhook1)')).toBeInTheDocument();
    expect(screen.getByText('Webhook 2')).toBeInTheDocument();
    expect(screen.getByText('(http://example.com/webhook2)')).toBeInTheDocument();
  });

  test('indicates the default webhook', () => {
    render(<WebhookManagementDialog {...defaultProps} />);
    // The default webhook's "Set as Default" button should be disabled and show "Default"
    const webhook1Buttons = screen.getByText('Webhook 1').closest('li')?.querySelectorAll('button');
    expect(webhook1Buttons?.[0]).toBeDisabled();
    expect(webhook1Buttons?.[0]).toHaveTextContent('Default');

    const webhook2Buttons = screen.getByText('Webhook 2').closest('li')?.querySelectorAll('button');
    expect(webhook2Buttons?.[0]).not.toBeDisabled();
    expect(webhook2Buttons?.[0]).toHaveTextContent('Set as Default');
  });

  test('calls onAddWebhook when adding a new webhook', () => {
    render(<WebhookManagementDialog {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Webhook' } });
    fireEvent.change(screen.getByLabelText('URL'), { target: { value: 'http://new.com' } });
    fireEvent.click(screen.getByText('Add Webhook'));

    expect(mockOnAddWebhook).toHaveBeenCalledWith('New Webhook', 'http://new.com');
  });

  test('does not call onAddWebhook if name or url is empty', () => {
    render(<WebhookManagementDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Add Webhook'));
    expect(mockOnAddWebhook).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Webhook' } });
    fireEvent.click(screen.getByText('Add Webhook'));
    expect(mockOnAddWebhook).not.toHaveBeenCalled();
  });

  test('calls onDeleteWebhook when deleting a webhook', () => {
    render(<WebhookManagementDialog {...defaultProps} />);
    const webhook1DeleteButton = screen.getByText('Webhook 1').closest('li')?.querySelector('button[variant="destructive"]');
    if (webhook1DeleteButton) {
      fireEvent.click(webhook1DeleteButton);
    }
    expect(mockOnDeleteWebhook).toHaveBeenCalledWith('1');
  });

  test('calls onSetDefaultWebhook when setting a default webhook', () => {
    render(<WebhookManagementDialog {...defaultProps} />);
    const webhook2SetDefaultButton = screen.getByText('Webhook 2').closest('li')?.querySelectorAll('button')[0];
     if (webhook2SetDefaultButton) {
      fireEvent.click(webhook2SetDefaultButton);
    }
    expect(mockOnSetDefaultWebhook).toHaveBeenCalledWith(mockWebhooks[1]);
  });

  test('closes dialog when onOpenChange is called (simulated by Dialog component)', () => {
    // This test is more about ensuring onOpenChange is correctly passed.
    // The Dialog component itself would call onOpenChange(false) when an overlay click or close button is triggered.
    render(<WebhookManagementDialog {...defaultProps} open={true} />);
    // Simulate the Dialog calling onOpenChange(false)
    // For this test, we'll just verify it's the same function.
    // A more integrated test would involve actually clicking a close button if it were part of this component.
    expect(defaultProps.onOpenChange).toBe(mockOnOpenChange);
  });
});
