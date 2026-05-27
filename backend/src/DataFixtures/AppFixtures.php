<?php

namespace App\DataFixtures;

use App\Entity\Demande;
use App\Entity\DemandeNaissance;
use App\Entity\Setting;
use App\Entity\TypeDemande;
use App\Entity\User;
use App\Enum\PrioriteEnum;
use App\Enum\RoleEnum;
use App\Enum\StatutDemandeEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher
    ) {
    }

    public function load(ObjectManager $manager): void
    {
        // 1. Settings
        $settings = [
            'two_factor' => 'false',
            'cloud_backup' => 'true',
            'maintenance' => 'false',
            'mairie_nom' => 'Mairie de Conakry',
            'mairie_email' => 'contact@mairie-conakry.gn',
        ];

        foreach ($settings as $k => $v) {
            $setting = new Setting();
            $setting->setKey($k);
            $setting->setValue($v);
            $manager->persist($setting);
        }

        // 2. Types de Demandes
        $typesData = [
            ['ACTE_NAISSANCE', "Extrait d'Acte de Naissance", 3],
            ['CERTIFICAT_RESIDENCE', "Certificat de Résidence", 2],
            ['CERTIFICAT_MARIAGE', "Extrait d'Acte de Mariage", 5],
            ['LEGALISATION_DOCUMENT', "Légalisation de document", 1],
            ['AUTORISATION_ADMINISTRATIVE', "Autorisation Administrative", 10],
            ['CHANGEMENT_ADRESSE', "Changement d'Adresse", 5],
        ];

        $types = [];
        foreach ($typesData as $data) {
            $type = new TypeDemande();
            $type->setCode($data[0]);
            $type->setLibelle($data[1]);
            $type->setDelaiJoursOuvrables($data[2]);
            $manager->persist($type);
            $types[$data[0]] = $type;
        }

        // 3. Utilisateurs
        $usersData = [
            ['admin@mairie.gn', RoleEnum::ADMINISTRATEUR, 'ADMIN', 'Super'],
            ['agent1@mairie.gn', RoleEnum::AGENT, 'DIALLO', 'Mamadou'],
            ['agent2@mairie.gn', RoleEnum::AGENT, 'SYLLA', 'Aissatou'],
            ['citoyen1@gmail.com', RoleEnum::CITOYEN, 'TOURE', 'Ibrahima'],
            ['citoyen2@gmail.com', RoleEnum::CITOYEN, 'BARRY', 'Mariama'],
            ['citoyen3@gmail.com', RoleEnum::CITOYEN, 'KEITA', 'Sekou'],
        ];

        $citoyens = [];
        foreach ($usersData as $data) {
            $user = new User();
            $user->setEmail($data[0]);
            $user->setRole($data[1]);
            $user->setNom($data[2]);
            $user->setPrenom($data[3]);
            $user->setPassword($this->passwordHasher->hashPassword($user, 'password'));
            $user->setIsActive(true);
            $manager->persist($user);

            if ($data[1] === RoleEnum::CITOYEN) {
                $citoyens[] = $user;
            }
        }

        // 4. Demandes de test
        foreach ($citoyens as $index => $citoyen) {
            $demande = new Demande();
            $demande->setUser($citoyen);
            $demande->setTypeDemande($types['ACTE_NAISSANCE']);
            $demande->setStatut(StatutDemandeEnum::EN_ATTENTE);
            $demande->setPriorite(PrioriteEnum::NORMALE);
            $demande->setNumeroDossier('MAI-' . date('Y') . '-' . sprintf('%05d', $index + 1));
            $demande->setDateEcheance((new \DateTime())->modify('+3 weekdays'));
            $manager->persist($demande);

            $naissance = new DemandeNaissance();
            $naissance->setDemande($demande);
            $naissance->setNom($citoyen->getNom());
            $naissance->setPrenoms($citoyen->getPrenom());
            $naissance->setDateNaissance(new \DateTime('-30 years'));
            $naissance->setLieuNaissance('Conakry');
            $naissance->setGenre('M');
            $naissance->setNombreCopies(2);
            $manager->persist($naissance);
        }

        $manager->flush();
    }
}
