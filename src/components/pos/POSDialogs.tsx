
import UtangDialog from '@/components/UtangDialog';
import SettingsDialog from '@/components/settings/SettingsDialog';

interface POSDialogsProps {
  utangDialogOpen: boolean;
  setUtangDialogOpen: (open: boolean) => void;
  settingsDialogOpen: boolean;
  setSettingsDialogOpen: (open: boolean) => void;
  totalAmount: number;
  onUtangConfirm: (debtorInfo: any) => void;
}

const POSDialogs = ({
  utangDialogOpen,
  setUtangDialogOpen,
  settingsDialogOpen,
  setSettingsDialogOpen,
  totalAmount,
  onUtangConfirm
}: POSDialogsProps) => {
  return (
    <>
      <UtangDialog
        open={utangDialogOpen}
        onOpenChange={setUtangDialogOpen}
        totalAmount={totalAmount}
        onUtangConfirm={onUtangConfirm}
      />

      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
    </>
  );
};

export default POSDialogs;
