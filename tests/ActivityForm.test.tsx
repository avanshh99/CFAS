import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import ActivityForm from '../src/components/tracker/ActivityForm';

describe('ActivityForm', () => {
  it('renders select inputs and form elements', () => {
    render(<ActivityForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('radio', { name: /Transport/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Activity Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log Activity/i })).toBeInTheDocument();
  });

  it('validates and rejects negative value on submission', async () => {
    render(<ActivityForm onSubmit={vi.fn()} />);
    
    const input = screen.getByLabelText(/Amount/i);
    fireEvent.change(input, { target: { value: '-10' } });
    
    const submitBtn = screen.getByRole('button', { name: /Log Activity/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Value must be greater than 0/i);
    });
  });

  it('triggers onSubmit callback on successful submission', async () => {
    const mockSubmit = vi.fn();
    render(<ActivityForm onSubmit={mockSubmit} />);

    const input = screen.getByLabelText(/Amount/i);
    fireEvent.change(input, { target: { value: '25.5' } });

    const submitBtn = screen.getByRole('button', { name: /Log Activity/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith('car_petrol_per_km', 25.5);
    });
  });
});
