import { ReservationWizard } from '../components/reservation/ReservationWizard';

export function ReservePage() {
  return (
    <div className="page page--reserve" aria-label="Table reservation enquiry">
      <ReservationWizard />
    </div>
  );
}
