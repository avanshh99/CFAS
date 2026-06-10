import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useCarbonStore } from '@/store/carbonStore';
import Tracker from '@/pages/Tracker';
import Dashboard from '@/pages/Dashboard';
import { decryptData } from '@/utils/encrypt';
import { MemoryRouter } from 'react-router-dom';

describe('Activity Tracker Integration Flow', () => {
  beforeEach(() => {
    useCarbonStore.setState({
      activities: [],
      actions: [],
    });
    localStorage.clear();
  });

  it('submits activity form, updates Zustand store, encrypts to localStorage, and updates Dashboard total', async () => {
    // 1. Render the Tracker component inside MemoryRouter
    const { unmount } = render(
      <MemoryRouter>
        <Tracker />
      </MemoryRouter>
    );

    // 2. Fill the form with valid transport data (e.g. 10 km on petrol car)
    const amountInput = screen.getByLabelText(/Amount/i);
    fireEvent.change(amountInput, { target: { value: '10' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Log Activity/i });
    fireEvent.click(submitButton);

    // 3. Wait for the store state to update and assert
    await waitFor(() => {
      expect(useCarbonStore.getState().activities.length).toBe(1);
    });

    const addedActivity = useCarbonStore.getState().activities[0];
    expect(addedActivity).toBeDefined();
    expect(addedActivity?.type).toBe('car_petrol_per_km');
    expect(addedActivity?.value).toBe(10);
    // petrol car rate is 0.192 per km. 10 * 0.192 = 1.92
    expect(addedActivity?.co2e).toBeCloseTo(1.92, 2);

    // 4. Assert that localStorage has the encrypted key
    const encryptedData = localStorage.getItem('ecosense-carbon-data');
    expect(encryptedData).not.toBeNull();
    
    // Decrypt and assert contents
    const decrypted = decryptData<{ activities: any[] }>(encryptedData!);
    expect(decrypted.activities.length).toBe(1);
    expect(decrypted.activities[0].value).toBe(10);

    // 5. Unmount Tracker and Render Dashboard to verify it picks up the store total
    unmount();
    
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Dashboard totals show the weekly total (which should now be 1.92 kg CO₂e, formatted to 1.9)
    await waitFor(() => {
      expect(screen.getByText('1.9')).toBeInTheDocument();
    });
  });
});
