import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart, faMagnifyingGlass, faSliders } from '@fortawesome/free-solid-svg-icons';
import { Auto } from '../../interfaces/auto';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'power-desc';

@Component({
  imports: [FontAwesomeModule],
  selector: 'app-search-bar',
  styleUrl: './search-bar.css',
  templateUrl: './search-bar.html',
})
export class SearchBar implements OnChanges {
  faMagnifyingGlass = faMagnifyingGlass;
  faSliders = faSliders;
  faHeart = faHeart;

  @Input() autos: Auto[] = [];
  @Input() favorites: Auto[] = [];
  @Input() favoritesCount = 0;
  @Input() showFavorites = false;
  @Output() onSelectCar = new EventEmitter<Auto>();
  @Output() onToggleFavorite = new EventEmitter<Auto>();
  @Output() onToggleFavorites = new EventEmitter<void>();

  selectedAutos: Auto[] = [];

  searchTerm = '';

  brands: string[] = [];
  brand = '';
  sortBy: SortOption = 'default';
  maxPrice = 0;
  minPower = 0;
  maxPriceInput = '';
  minPowerInput = '';

  priceFloor = 0;
  priceCeil = 0;
  powerFloor = 0;
  powerCeil = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['autos']) {
      this.updateBounds();
      this.applyFilters();
    }
  }

  get hasActiveFilters(): boolean {
    return (
      !!this.searchTerm.trim() ||
      !!this.brand ||
      this.sortBy !== 'default' ||
      this.maxPrice < this.priceCeil ||
      this.minPower > this.powerFloor
    );
  }

  private updateBounds() {
    if (!this.autos.length) {
      this.brands = [];
      this.priceFloor = this.priceCeil = this.maxPrice = 0;
      this.powerFloor = this.powerCeil = this.minPower = 0;
      this.maxPriceInput = '';
      this.minPowerInput = '';
      return;
    }

    const prices = this.autos.map(auto => auto.price);
    const powers = this.autos.map(auto => auto.power);
    this.priceFloor = Math.min(...prices);
    this.priceCeil = Math.max(...prices);
    this.powerFloor = Math.min(...powers);
    this.powerCeil = Math.max(...powers);
    this.brands = [...new Set(this.autos.map(auto => auto.brand))].sort();

    if (!this.maxPrice || this.maxPrice > this.priceCeil) {
      this.maxPrice = this.priceCeil;
      this.maxPriceInput = '';
    }
    if (this.minPower < this.powerFloor) {
      this.minPower = this.powerFloor;
      this.minPowerInput = '';
    }
  }

  applyFilters() {
    const term = this.searchTerm.trim().toLocaleLowerCase();

    const matches = this.autos.filter(
      auto =>
        `${auto.brand} ${auto.model}`.toLocaleLowerCase().includes(term) &&
        (!this.brand || auto.brand === this.brand) &&
        auto.price <= this.maxPrice &&
        auto.power >= this.minPower,
    );

    this.selectedAutos = this.sortCars(matches);
  }

  private sortCars(list: Auto[]): Auto[] {
    switch (this.sortBy) {
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price);
      case 'power-desc':
        return [...list].sort((a, b) => b.power - a.power);
      default:
        return list;
    }
  }

  onSearchInput(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  onBrandChange(event: Event) {
    this.brand = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  onSortChange(event: Event) {
    this.sortBy = (event.target as HTMLSelectElement).value as SortOption;
    this.applyFilters();
  }

  onMaxPriceInput(value: string) {
    this.maxPriceInput = value;
    const parsed = Number(value);
    this.maxPrice = value.trim() === '' || Number.isNaN(parsed) ? this.priceCeil : parsed;
    this.applyFilters();
  }

  onMinPowerInput(value: string) {
    this.minPowerInput = value;
    const parsed = Number(value);
    this.minPower = value.trim() === '' || Number.isNaN(parsed) ? this.powerFloor : parsed;
    this.applyFilters();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }

  resetFilters() {
    this.searchTerm = '';
    this.brand = '';
    this.sortBy = 'default';
    this.maxPrice = this.priceCeil;
    this.minPower = this.powerFloor;
    this.maxPriceInput = '';
    this.minPowerInput = '';
    this.applyFilters();
  }

  selectCar(auto: Auto) {
    this.onSelectCar.emit(auto);
  }

  isFavorite(auto: Auto): boolean {
    return this.favorites.some(favorite => favorite.id === auto.id);
  }

  toggleFavorite(auto: Auto) {
    this.onToggleFavorite.emit(auto);
  }

  toggleFavorites() {
    this.onToggleFavorites.emit();
  }
}
