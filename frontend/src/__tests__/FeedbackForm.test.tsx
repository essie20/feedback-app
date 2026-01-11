import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FeedbackForm from '../components/FeedbackForm';

describe('FeedbackForm', () => {
    const mockOnSubmit = vi.fn();

    beforeEach(() => {
        mockOnSubmit.mockClear();
    });

    it('renders the form correctly', () => {
        render(<FeedbackForm onSubmit={mockOnSubmit} />);

        expect(screen.getByText('Share Your Feedback')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/What's on your mind/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Submit Feedback/i })).toBeInTheDocument();
    });

    it('disables submit button when textarea is empty', () => {
        render(<FeedbackForm onSubmit={mockOnSubmit} />);

        const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
        expect(submitButton).toBeDisabled();
    });

    it('enables submit button when text is entered', () => {
        render(<FeedbackForm onSubmit={mockOnSubmit} />);

        const textarea = screen.getByPlaceholderText(/What's on your mind/i);
        fireEvent.change(textarea, { target: { value: 'Test feedback' } });

        const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
        expect(submitButton).not.toBeDisabled();
    });

    it('calls onSubmit with text when form is submitted', async () => {
        mockOnSubmit.mockResolvedValue(true);
        render(<FeedbackForm onSubmit={mockOnSubmit} />);

        const textarea = screen.getByPlaceholderText(/What's on your mind/i);
        fireEvent.change(textarea, { target: { value: 'Test feedback' } });

        const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith('Test feedback');
        });
    });

    it('clears textarea after successful submission', async () => {
        mockOnSubmit.mockResolvedValue(true);
        render(<FeedbackForm onSubmit={mockOnSubmit} />);

        const textarea = screen.getByPlaceholderText(/What's on your mind/i) as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: 'Test feedback' } });

        const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(textarea.value).toBe('');
        });
    });

    it('shows character count', () => {
        render(<FeedbackForm onSubmit={mockOnSubmit} />);

        const textarea = screen.getByPlaceholderText(/What's on your mind/i);
        fireEvent.change(textarea, { target: { value: 'Hello' } });

        expect(screen.getByText('5/1000')).toBeInTheDocument();
    });

    it('respects the disabled prop', () => {
        render(<FeedbackForm onSubmit={mockOnSubmit} disabled />);

        const textarea = screen.getByPlaceholderText(/What's on your mind/i);
        expect(textarea).toBeDisabled();
    });
});
