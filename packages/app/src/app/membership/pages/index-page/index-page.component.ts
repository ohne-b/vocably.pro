import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { EntitlementInfo, Purchases, Store } from '@revenuecat/purchases-js';
import { getUserStaticMetadata } from '@vocably/api';
import { startWith, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { MembershipSelectorComponent } from '../../../components/membership-selector/membership-selector.component';
import { HeaderComponent } from '../../../header/header.component';
import { WhyPaidComponent } from './why-paid/why-paid.component';

type MembershipStatus =
  | {
      type: 'loading';
    }
  | {
      type: 'free';
    }
  | {
      type: 'paid_group';
    }
  | {
      type: 'revenue_cat';
      managementUrl: string | null;
      nextPaymentDate: Date | null;
      endDate: Date | null;
      entitlementInfo: EntitlementInfo;
    }
  | {
      type: 'error';
    };

const storeNames: Partial<Record<Store, string>> = {
  app_store: 'App Store',
  mac_app_store: 'Mac App Store',
  play_store: 'Google Play',
  amazon: 'Amazon Appstore',
  paddle: 'Paddle',
  stripe: 'Stripe',
  rc_billing: 'Web',
};

@Component({
  selector: 'app-index-page',
  templateUrl: './index-page.component.html',
  styleUrls: ['./index-page.component.scss'],
  imports: [
    HeaderComponent,
    IonicModule,
    MatIcon,
    MembershipSelectorComponent,
    TranslocoModule,
  ],
})
export class IndexPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  public membershipStatus: MembershipStatus = {
    type: 'loading',
  };

  public reload$ = new Subject<'with_loader' | 'without_loader'>();

  public benefits = [
    'membership_selector.unlimited_translations',
    'membership_selector.unlimited_collections',
    'membership_selector.unlimited_sessions',
    'membership_selector.unlimited_decks',
    'membership.unlimited_cards',
    'membership_selector.cloud_storage',
  ];

  constructor(
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.reload$
      .pipe(
        startWith('with_loader'),
        tap(() => {
          this.membershipStatus = {
            type: 'loading',
          };
        }),
        switchMap(() => {
          return this.authService.fetchUserData$.pipe(
            switchMap((userData) => {
              const purchases = Purchases.configure(
                'rcb_npVnGSbfiQAcvvQkQxFrIEiGibAJ',
                userData.sub
              );
              return Promise.all([
                this.authService.isPaidGroup(),
                purchases.getCustomerInfo(),
                getUserStaticMetadata(),
              ]);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ([isPaidGroup, customerInfo, staticMetadataResult]) => {
          if (customerInfo.entitlements.active['premium']) {
            this.membershipStatus = {
              type: 'revenue_cat',
              nextPaymentDate:
                (customerInfo.entitlements.active['premium'] &&
                  customerInfo.entitlements.active['premium'].willRenew &&
                  customerInfo.entitlements.active['premium'].expirationDate) ||
                null,
              managementUrl:
                customerInfo.entitlements.active['premium'] &&
                customerInfo.entitlements.active['premium'].store ===
                  'paddle' &&
                staticMetadataResult.success === true
                  ? staticMetadataResult.value.management_url
                  : customerInfo.managementURL,
              endDate:
                (customerInfo.entitlements.active['premium'] &&
                  !customerInfo.entitlements.active['premium'].willRenew &&
                  customerInfo.entitlements.active['premium'].expirationDate) ||
                null,
              entitlementInfo: customerInfo.entitlements.active['premium'],
            };

            return;
          } else if (isPaidGroup) {
            this.membershipStatus = {
              type: 'paid_group',
            };
          } else {
            this.membershipStatus = {
              type: 'free',
            };
          }
        },
        error: () => {
          this.membershipStatus = {
            type: 'error',
          };
        },
      });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString(undefined, { dateStyle: 'long' });
  }

  storeName(store: Store): string | null {
    return storeNames[store] ?? null;
  }

  showWhyPaid() {
    this.dialog.open(WhyPaidComponent);
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
