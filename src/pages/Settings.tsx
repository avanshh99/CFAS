// ============================================================
// Settings Page — User profile and application configs
// ============================================================

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings as SettingsIcon, Save, Trash2, ShieldAlert, Check } from 'lucide-react';
import { useCarbonStore } from '../store/carbonStore';
import { settingsSchema, type SettingsInput } from '../utils/validators';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const Settings: React.FC = () => {
  const { settings, updateSettings, clearActivities, loadFromStorage } = useCarbonStore();
  const [success, setSuccess] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  // Keep form fields synced if store loaded
  useEffect(() => {
    setValue('name', settings.name);
    setValue('region', settings.region);
    setValue('monthlyBudgetKg', settings.monthlyBudgetKg);
    setValue('weeklyGoalKg', settings.weeklyGoalKg);
    setValue('currency', settings.currency);
  }, [settings, setValue]);

  const onSubmit = (data: SettingsInput) => {
    updateSettings(data);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleClearData = () => {
    clearActivities();
    setConfirmClear(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-green-600" />
              Application Settings
            </CardTitle>
            <CardDescription>
              Configure your personal target thresholds, regional emission baseline modifiers, and profile info.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Row 1: Name & Region */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="settings-name" className="eco-label">Your Name</label>
                <Input
                  id="settings-name"
                  type="text"
                  error={errors.name?.message}
                  {...register('name')}
                />
              </div>
              <div>
                <label htmlFor="settings-region" className="eco-label">Location / Region</label>
                <select
                  id="settings-region"
                  className="eco-input h-10 py-2"
                  {...register('region')}
                >
                  <option value="India">India (CEA Grid Factor)</option>
                  <option value="US">United States (EPA Grid Factor)</option>
                  <option value="Europe">Europe (EEA Grid Factor)</option>
                  <option value="Other">Global Average (IPCC Grid Factor)</option>
                </select>
                {errors.region && (
                  <p className="mt-1 text-xs text-red-500" role="alert">
                    {errors.region.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Target thresholds */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="settings-monthly-budget" className="eco-label">Monthly Carbon Budget (kg CO₂e)</label>
                <Input
                  id="settings-monthly-budget"
                  type="number"
                  error={errors.monthlyBudgetKg?.message}
                  {...register('monthlyBudgetKg', { valueAsNumber: true })}
                />
              </div>
              <div>
                <label htmlFor="settings-weekly-goal" className="eco-label">Weekly Reduction Goal (kg CO₂e)</label>
                <Input
                  id="settings-weekly-goal"
                  type="number"
                  error={errors.weeklyGoalKg?.message}
                  {...register('weeklyGoalKg', { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Row 3: Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="settings-currency" className="eco-label">Preferred Currency</label>
                <select
                  id="settings-currency"
                  className="eco-input h-10 py-2"
                  {...register('currency')}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </select>
                {errors.currency && (
                  <p className="mt-1 text-xs text-red-500" role="alert">
                    {errors.currency.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t border-gray-50 pt-6">
            <div className="text-xs text-gray-400">
              Settings are saved automatically to your browser via local encryption.
            </div>
            <div className="flex gap-2">
              {success && (
                <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg animate-fade-in">
                  <Check className="h-4 w-4" />
                  Saved!
                </span>
              )}
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>

      {/* Danger Zone */}
      <Card className="border-red-100 bg-red-50/20">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-700/80">
            Destructive options. These settings will wipe or permanently modify your locally stored footprint data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-950">Clear all logged activity history</p>
              <p className="text-xs text-gray-500 mt-0.5">
                This action is irreversible. All transport, energy, food, shopping, and waste entries will be permanently deleted.
              </p>
            </div>
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <Button variant="destructive" onClick={handleClearData} size="sm">
                  Yes, delete all
                </Button>
                <Button variant="outline" onClick={() => setConfirmClear(false)} size="sm">
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="destructive" onClick={() => setConfirmClear(true)} size="sm" className="gap-1.5">
                <Trash2 className="h-4 w-4" />
                Clear Data
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
