<?php

namespace App\Service;

use App\Entity\Demande;
use App\Repository\RendezVousRepository;

class SlotService
{
    public function __construct(
        private RendezVousRepository $rendezVousRepository
    ) {
    }

    public function getAvailableSlots(Demande $demande): array
    {
        $slots = [];
        $date = new \DateTime();
        
        // Generate for 7 business days
        $daysAdded = 0;
        while ($daysAdded < 7) {
            $date->modify('+1 day');
            if ($date->format('N') < 6) { // Monday-Friday
                $dateStr = $date->format('Y-m-d');
                $slots[$dateStr] = [];
                
                // 09:00 to 16:00, 30 min slots
                for ($hour = 9; $hour <= 16; $hour++) {
                    foreach (['00', '30'] as $minute) {
                        if ($hour === 16 && $minute === '30') continue; // Last slot starts at 16:00
                        $timeStr = sprintf('%02d:%s', $hour, $minute);
                        $datetimeStr = $dateStr . ' ' . $timeStr . ':00';
                        $slots[$dateStr][] = $datetimeStr;
                    }
                }
                $daysAdded++;
            }
        }

        // Get booked slots (in a real app, we might check all RDVs, or just those that overlap)
        $start = new \DateTime();
        $end = (clone $start)->modify('+14 days');
        
        $bookedRdvs = $this->rendezVousRepository->createQueryBuilder('r')
            ->where('r.dateRdv >= :start')
            ->andWhere('r.dateRdv <= :end')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->getQuery()
            ->getResult();

        $bookedSlotStrings = array_map(function($rdv) {
            return $rdv->getDateRdv()->format('Y-m-d H:i:s');
        }, $bookedRdvs);

        // Remove booked slots
        foreach ($slots as $dateStr => $daySlots) {
            $slots[$dateStr] = array_values(array_filter($daySlots, function($slot) use ($bookedSlotStrings) {
                return !in_array($slot, $bookedSlotStrings);
            }));
            
            // Remove empty days
            if (empty($slots[$dateStr])) {
                unset($slots[$dateStr]);
            }
        }

        return $slots;
    }
}
