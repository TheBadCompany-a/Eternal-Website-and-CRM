import React, { useState } from 'react';
import type { BookingDraft, BookingReference } from '../../../utils/crmBooking';
import { loadBookingRef, loadBookingSummary } from '../../../utils/crmBooking';
import { StepRail } from './StepRail';
import { Step1Arrival } from './steps/Step1Arrival';
import { Step2ChooseNeed } from './steps/Step2ChooseNeed';
import { Step3Requirements } from './steps/Step3Requirements';
import { Step4PlanSynthesis } from './steps/Step4PlanSynthesis';
import { Step5ThePlan } from './steps/Step5ThePlan';
import { Step6HumanCare } from './steps/Step6HumanCare';
import { Step7Details } from './steps/Step7Details';
import { Step8Review } from './steps/Step8Review';
import { Step9Confirmation } from './steps/Step9Confirmation';

export const DEFAULT_DRAFT: BookingDraft = {
  needCategory: 'Immediate Arrangement',
  pickupLocation: '',
  destinationLocation: '',
  date: new Date().toISOString().slice(0, 10),
  time: '',
  services: [],
  notes: '',
  contactName: '',
  city: '',
  phone: '',
  email: '',
  relationship: '',
  deceasedName: '',
};

export const ArrangeServiceWizard: React.FC = () => {
  const [bookingRef, setBookingRef] = useState<BookingReference | null>(() => loadBookingRef());
  const [step, setStep] = useState(() => (loadBookingRef() ? 9 : 1));
  const [draft, setDraft] = useState<BookingDraft>(DEFAULT_DRAFT);

  const goToStep = (n: number) => setStep(Math.min(9, Math.max(1, n)));
  const updateDraft = (patch: Partial<BookingDraft>) => setDraft((prev) => ({ ...prev, ...patch }));

  return (
    <section
      id="arrange-a-service"
      className="py-20 md:py-28 px-6 md:px-12 bg-blush/30 border-y border-gold/15 scroll-mt-24"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <span className="inline-flex items-center gap-3 mb-4 justify-center">
            <span className="w-10 h-[1px] bg-gold/60 inline-block" />
            <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-semibold">
              Start Right Here
            </span>
            <span className="w-10 h-[1px] bg-gold/60 inline-block" />
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-semibold text-deep-brown leading-tight mb-4">
            Arrange a Service
          </h2>
          <p className="text-base md:text-lg text-charcoal/70 font-light leading-relaxed">
            A calm, guided path to an indicative plan — no forms up front, just a few gentle questions. Your
            coordinator confirms every detail before anything is final.
          </p>
        </div>

        <div className="bg-white border border-gold/25 rounded-xs shadow-lg overflow-hidden">
          <StepRail currentStep={step} onGoToStep={goToStep} />

          {/* Extra bottom padding on mobile only: the Services page has a
              fixed Call/WhatsApp bar pinned to the bottom of the viewport
              (see ServicesView.tsx's "STICKY MOBILE CTA BAR"), which can
              otherwise trap this card's own Back/Next buttons underneath it
              with no further room to scroll them clear. */}
          <div className="p-6 sm:p-8 md:p-10 pb-28 md:pb-10">
            {step === 1 && <Step1Arrival onNext={() => goToStep(2)} onSkipToHelp={() => goToStep(6)} />}
            {step === 2 && <Step2ChooseNeed draft={draft} updateDraft={updateDraft} onBack={() => goToStep(1)} onNext={() => goToStep(3)} />}
            {step === 3 && (
              <Step3Requirements
                draft={draft}
                updateDraft={updateDraft}
                onBack={() => goToStep(2)}
                onNext={() => goToStep(4)}
              />
            )}
            {step === 4 && <Step4PlanSynthesis onDone={() => goToStep(5)} />}
            {step === 5 && (
              <Step5ThePlan
                draft={draft}
                onBack={() => goToStep(3)}
                onTalkToSomeone={() => goToStep(6)}
                onNext={() => goToStep(7)}
              />
            )}
            {step === 6 && <Step6HumanCare onBack={() => goToStep(5)} onNext={() => goToStep(7)} />}
            {step === 7 && (
              <Step7Details draft={draft} updateDraft={updateDraft} onBack={() => goToStep(5)} onNext={() => goToStep(8)} />
            )}
            {step === 8 && (
              <Step8Review
                draft={draft}
                onBack={() => goToStep(7)}
                onSubmitted={(ref) => {
                  setBookingRef(ref);
                  goToStep(9);
                }}
              />
            )}
            {step === 9 && bookingRef && <Step9Confirmation bookingRef={bookingRef} summary={loadBookingSummary() ?? draft} />}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArrangeServiceWizard;
